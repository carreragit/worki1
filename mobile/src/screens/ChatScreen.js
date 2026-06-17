/**
 * ChatScreen
 *
 * Chat en tiempo real entre cliente y trabajador, disponible solo cuando
 * la solicitud está en estado ACEPTADA.
 *
 * Ciclo de vida de la conexión WebSocket:
 *   1. Al montar: carga el historial HTTP (cargarMensajes) y luego conecta STOMP.
 *   2. Al conectar: se suscribe al topic /topic/chat/{solicitudId} para recibir mensajes nuevos.
 *   3. Al desmontar (cleanup del useEffect): llama a stompRef.current.deactivate()
 *      para cerrar la conexión y liberar recursos — evita memory leaks y mensajes duplicados.
 *
 * Notas técnicas:
 *   - Se usa webSocketFactory (no brokerURL) porque React Native no incluye WebSocket global.
 *   - forceBinaryWSFrames + appendMissingNULLonIncoming resuelven problemas de frames STOMP en RN.
 *   - Las imágenes se suben primero vía HTTP y luego se envía la URL por el WebSocket.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Client } from '@stomp/stompjs';
import { cargarHistorial, subirImagen, WS_URL } from '../services/mensajeService';
import { getToken } from '../services/authService';
import { useUser } from '../context/UserContext';
import { COLORS } from '../theme';

// URL del endpoint WebSocket STOMP del interaction-service.
const STOMP_URL = `${WS_URL}/ws`;

export default function ChatScreen({ route, navigation }) {
  const { solicitud } = route.params;
  const { user } = useUser();

  const [mensajes, setMensajes]     = useState([]);
  const [texto, setTexto]           = useState('');
  const [cargando, setCargando]     = useState(true);
  const [enviando, setEnviando]     = useState(false);
  const [conectado, setConectado]   = useState(false);

  // Referencia al cliente STOMP para poder desconectarlo al salir
  const stompRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    inicializar();
    return () => {
      // Desconectar WebSocket al salir de la pantalla para liberar recursos
      if (stompRef.current?.active) {
        stompRef.current.deactivate();
      }
    };
  }, []);

  const inicializar = async () => {
    await cargarMensajes();
    const token = await getToken();
    conectarWebSocket(token);
  };

  // Carga el historial previo del chat antes de conectar el WebSocket
  const cargarMensajes = async () => {
    try {
      const data = await cargarHistorial(solicitud.id);
      setMensajes(data);
    } catch {
      // Si falla el historial, el chat igual puede funcionar en tiempo real
    } finally {
      setCargando(false);
    }
  };

  // Conecta el cliente STOMP y se suscribe al topic de esta solicitud
  const conectarWebSocket = (token) => {
    const client = new Client({
      // React Native necesita webSocketFactory en lugar de brokerURL
      webSocketFactory: () => new WebSocket(STOMP_URL),
      // Reconexión automática cada 5 segundos si se pierde la conexión
      reconnectDelay: 5000,
      // React Native no transmite bien el terminador NULL de los frames STOMP como texto;
      // forzar frames binarios resuelve que el servidor no reciba el CONNECT.
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      // El servidor valida este token en el interceptor STOMP para autenticar al usuario
      connectHeaders: { token },
      onConnect: () => {
        setConectado(true);
        // Suscribirse al canal de esta solicitud específica
        client.subscribe(`/topic/chat/${solicitud.id}`, (frame) => {
          const nuevoMensaje = JSON.parse(frame.body);
          setMensajes(prev => [...prev, nuevoMensaje]);
        });
      },
      onDisconnect: () => setConectado(false),
      onStompError: () => setConectado(false),
      onWebSocketError: () => setConectado(false),
      onWebSocketClose: () => setConectado(false),
    });

    client.activate();
    stompRef.current = client;
  };

  // Envía un mensaje de texto por WebSocket
  const enviarTexto = () => {
    if (!texto.trim() || !conectado) return;
    stompRef.current.publish({
      destination: `/app/chat/${solicitud.id}`,
      body: JSON.stringify({
        remitenteId: user.userId,
        tipo: 'TEXTO',
        contenido: texto.trim(),
      }),
    });
    setTexto('');
  };

  // Abre el selector de imagen, sube la imagen y envía la URL por WebSocket
  const enviarImagen = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para enviar imágenes.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      // SDK 54+: usar array de strings en lugar de MediaTypeOptions (deprecado)
      mediaTypes: ['images'],
      quality: 0.7, // comprimir para no saturar el servidor
    });
    if (resultado.canceled) return;

    setEnviando(true);
    try {
      const url = await subirImagen(resultado.assets[0].uri);
      stompRef.current.publish({
        destination: `/app/chat/${solicitud.id}`,
        body: JSON.stringify({
          remitenteId: user.userId,
          tipo: 'IMAGEN',
          contenido: url,
        }),
      });
    } catch {
      Alert.alert('Error', 'No se pudo enviar la imagen.');
    } finally {
      setEnviando(false);
    }
  };

  // Renderiza cada burbuja de mensaje diferenciando si es mío o del otro usuario
  const renderMensaje = useCallback(({ item }) => {
    const esMio = item.remitenteId === user.userId;
    return (
      <View style={[styles.burbuja, esMio ? styles.burbujaPropia : styles.burbujaAjena]}>
        {!esMio && (
          <Text style={styles.nombreRemitente}>{item.nombreRemitente ?? 'Usuario'}</Text>
        )}
        {item.tipo === 'IMAGEN' ? (
          // Las imágenes se cargan desde la URL del servidor
          <Image
            source={{ uri: `${WS_URL}${item.contenido}` }}
            style={styles.imagenMensaje}
            resizeMode="cover"
          />
        ) : (
          <Text style={[styles.textoMensaje, esMio && styles.textoMensajePropio]}>
            {item.contenido}
          </Text>
        )}
        <Text style={[styles.hora, esMio && styles.horaPropia]}>
          {item.createdAt
            ? new Date(item.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
            : ''}
        </Text>
      </View>
    );
  }, [user.userId]);

  return (
    <SafeAreaView style={styles.pantalla}>
      {/* HEADER con nombre del otro participante y estado de conexión */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnAtras}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerNombre}>
            {user.userId === solicitud.clienteId
              ? solicitud.nombreTrabajador
              : solicitud.nombreCliente}
          </Text>
          <View style={styles.estadoConexion}>
            <View style={[styles.puntito, { backgroundColor: conectado ? COLORS.primary : COLORS.textMuted }]} />
            <Text style={styles.estadoTexto}>{conectado ? 'Conectado' : 'Reconectando...'}</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* LISTA DE MENSAJES */}
        {cargando ? (
          <View style={styles.centrado}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={mensajes}
            keyExtractor={item => String(item.id ?? Math.random())}
            renderItem={renderMensaje}
            contentContainerStyle={styles.listaPadding}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {/* INPUT DE MENSAJE */}
        <View style={styles.inputRow}>
          {/* Botón para adjuntar imagen */}
          <TouchableOpacity onPress={enviarImagen} disabled={enviando || !conectado} style={styles.btnImagen}>
            {enviando
              ? <ActivityIndicator size="small" color={COLORS.textSecondary} />
              : <Ionicons name="image-outline" size={24} color={conectado ? COLORS.textSecondary : COLORS.disabled} />
            }
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={COLORS.textMuted}
            value={texto}
            onChangeText={setTexto}
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            onPress={enviarTexto}
            disabled={!texto.trim() || !conectado}
            style={[styles.btnEnviar, (!texto.trim() || !conectado) && styles.btnEnviarDisabled]}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.surfaceAlt },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  btnAtras: { padding: 4, marginRight: 12 },
  headerInfo: { flex: 1 },
  headerNombre: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  estadoConexion: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  puntito: { width: 7, height: 7, borderRadius: 4 },
  estadoTexto: { fontSize: 11, color: COLORS.textSecondary },

  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listaPadding: { padding: 12, paddingBottom: 4 },

  burbuja: {
    maxWidth: '75%', padding: 10, borderRadius: 14,
    marginBottom: 8,
  },
  burbujaAjena: {
    alignSelf: 'flex-start', backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
  },
  burbujaPropia: {
    alignSelf: 'flex-end', backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  nombreRemitente: { fontSize: 11, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  textoMensaje: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
  textoMensajePropio: { color: COLORS.surface },
  imagenMensaje: { width: 200, height: 160, borderRadius: 8 },
  hora: { fontSize: 10, color: COLORS.textMuted, marginTop: 4, alignSelf: 'flex-end' },
  horaPropia: { color: COLORS.primaryLight },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  btnImagen: { padding: 8 },
  input: {
    flex: 1, minHeight: 40, maxHeight: 100,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    fontSize: 14, color: COLORS.textPrimary, backgroundColor: COLORS.background,
  },
  btnEnviar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  btnEnviarDisabled: { backgroundColor: COLORS.disabled },
});
