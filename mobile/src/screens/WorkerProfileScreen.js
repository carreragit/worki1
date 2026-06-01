import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SHADOWS } from '../theme';

const HEADER_COLOR = '#41836c'; // Color base del gradiente de Worki

export default function WorkerProfileScreen({ navigation }) {
  // ── MOCK DATA DEL TRABAJADOR (RESPALDO OFFLINE) ──
  const workerMock = {
    id: 'worker_123',
    nombre: 'Héctor Silva',
    oficio: 'Gasfíter',
    rating: '4.8',
    reseñasCount: 67,
    experiencia: '5 años',
    precioBase: '25.000',
    comuna: 'Providencia',
    radioCobertura: '8 km',
    avatarColor: '#16A34A',
    iniciales: 'HS',
    descripcion: 'Técnico certificado con más de 5 años realizando servicios de instalación y reparación de redes de agua caliente y fría, calefonts, mantención de griferías, fugas y emergencias las 24 horas. Garantía por escrito en todos mis trabajos.',
    especialidades: [
      'Cañerías PPR y Cobre',
      'Instalación de Calefont',
      'Filtraciones e Infiltraciones',
      'Reparación de Griferías',
      'Emergencias 24/7',
      'Destapes Sanitarios'
    ],
    reseñas: [
      { id: 1, nombre: 'Sofía Valenzuela', rating: 5, fecha: 'Hace 2 días', comentario: 'Excelente servicio. Héctor llegó muy rápido para solucionar una filtración de agua en mi cocina. Muy profesional y limpio.' },
      { id: 2, nombre: 'Mariano Tapia', rating: 4, fecha: 'Hace 1 semana', comentario: 'Instaló un calefont nuevo. Explicó todo el funcionamiento y dejó todo certificado. Muy recomendado.' },
      { id: 3, nombre: 'Clara Soto', rating: 5, fecha: 'Hace 2 semanas', comentario: 'Rápido, ordenado y cobró lo justo. Sin duda lo volveré a contactar.' }
    ]
  };

  // ── ESTADOS PARA LA INTEGRACIÓN CON BACKEND (API GATEWAY) ──
  const [workerData, setWorkerData] = useState(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [errorFetch, setErrorFetch] = useState(false);

  // ── ESTADOS DE LA VISTA E INTERACCIONES ──
  const [tabActivo, setTabActivo] = useState('Información');
  const [favorito, setFavorito] = useState(false);

  // ── ESTADOS DE LA LÓGICA DE NEGOCIO ──
  const [loading, setLoading] = useState(false);
  const [solicitudPendiente, setSolicitudPendiente] = useState(false);
  const [chatHabilitado, setChatHabilitado] = useState(false);

  // ── CONSUMO DEL API GATEWAY (MÓDULO USER-SERVICE) ──
  useEffect(() => {
    // TIP EXPERTO: En emuladores de Android, 'localhost' apunta al propio emulador.
    // Si estás testeando en un dispositivo físico o emulador Android, puedes cambiar 
    // 'localhost' por la IP de tu PC o por '10.0.2.2' para mapear el localhost de tu PC.
    const GATEWAY_URL = 'http://localhost:8080/api/perfiles/2'; 
    
    fetch(GATEWAY_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token_de_prueba_temporal'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP Error Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setWorkerData(data);
        setIsFetchingProfile(false);
      })
      .catch(error => {
        console.warn('Conexión con Gateway fallida. Activando Plan B (Mock):', error);
        setErrorFetch(true);
        setIsFetchingProfile(false);
      });
  }, []);

  // ── MAPEADO DINÁMICO DE CAMPOS ──
  const nombre = workerData?.nombreCompleto || workerMock.nombre;
  const descripcion = workerData?.descripcion || workerMock.descripcion;
  const comuna = workerData?.ciudad || workerMock.comuna;
  const iniciales = workerData 
    ? workerData.nombreCompleto.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
    : workerMock.iniciales;

  const handleSolicitarServicio = () => {
    if (solicitudPendiente || loading) return;
    
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      setSolicitudPendiente(true);
      setChatHabilitado(true);
    }, 1000);
  };

  const handleAbrirChat = () => {
    if (!chatHabilitado) {
      Alert.alert(
        '🔒 Restricción de Negocio',
        `No puedes chatear directamente con el profesional. Primero debes enviar una "Solicitud de Servicio" para formalizar la intención.`,
        [{ text: 'Entendido' }]
      );
      return;
    }
    Alert.alert('Mensajería', `Abriendo chat formalizado con ${nombre}...`);
  };

  const reiniciarSimulacion = () => {
    setLoading(false);
    setSolicitudPendiente(false);
    setChatHabilitado(false);
  };

  if (isFetchingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando perfil del profesional...</Text>
        <Text style={styles.loadingSubtext}>Conectando con el API Gateway...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar barStyle="light-content" backgroundColor={HEADER_COLOR} />
      
      {/* ── CONTENEDOR RESPONSIVO DE ANCHO MÁXIMO PARA REACT NATIVE WEB ── */}
      <View style={styles.contenedorWebWeb}>
      
        {/* ── BANNER AMARILLO DE MODO OFFLINE (PLAN B) ── */}
        {errorFetch && (
          <View style={styles.offlineBanner}>
            <Ionicons name="warning-outline" size={16} color="#FFFFFF" />
            <Text style={styles.offlineBannerTexto}>Modo Offline: Mostrando datos de prueba</Text>
          </View>
        )}

        {/* ── HEADER SUPERIOR (Emula el gradiente) ── */}
        <View style={styles.header}>
          <View style={styles.headerBar}>
            <TouchableOpacity 
              onPress={() => navigation && navigation.goBack()} 
              style={styles.headerBoton}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitulo}>Ficha del Profesional</Text>
            <TouchableOpacity 
              onPress={() => setFavorito(!favorito)} 
              style={styles.headerBoton}
            >
              <Ionicons 
                name={favorito ? "heart" : "heart-outline"} 
                size={24} 
                color={favorito ? "#DC2626" : "#FFFFFF"} 
              />
            </TouchableOpacity>
          </View>

          {/* ── CARD DE PERFIL DENTRO DEL HEADER ── */}
          <View style={styles.perfilInfoBox}>
            <View style={[styles.avatar, { backgroundColor: workerMock.avatarColor }]}>
              <Text style={styles.avatarTexto}>{iniciales}</Text>
            </View>

            <View style={styles.badgeVerificado}>
              <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
              <Text style={styles.badgeVerificadoTexto}>Identidad Verificada</Text>
            </View>

            <Text style={styles.nombreCompleto}>{nombre}</Text>
            <Text style={styles.oficioTexto}>{workerMock.oficio} Certificado</Text>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValor}>★ {workerMock.rating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statSeparador} />
              <View style={styles.statBox}>
                <Text style={styles.statValor}>{workerMock.reseñasCount}</Text>
                <Text style={styles.statLabel}>Reseñas</Text>
              </View>
              <View style={styles.statSeparador} />
              <View style={styles.statBox}>
                <Text style={styles.statValor}>{workerMock.experiencia}</Text>
                <Text style={styles.statLabel}>Exp.</Text>
              </View>
            </View>

            <View style={styles.ubicacionRow}>
              <Ionicons name="location-sharp" size={14} color="#FFFFFF" />
              <Text style={styles.ubicacionTexto}>
                {comuna} · Cobertura {workerMock.radioCobertura}
              </Text>
            </View>
          </View>
        </View>

        {/* ── NAVEGACIÓN PESTAÑAS (TABS) ── */}
        <View style={styles.tabsContainer}>
          {['Información', 'Reseñas', 'Servicios'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setTabActivo(tab)}
              style={[styles.tabBoton, tabActivo === tab && styles.tabBotonActivo]}
            >
              <Text style={[styles.tabTexto, tabActivo === tab && styles.tabTextoActivo]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── CONTENIDO DINÁMICO DE PESTAÑAS (SCROLLABLE) ── */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {tabActivo === 'Información' && (
            <View style={styles.seccion}>
              <Text style={styles.seccionTitulo}>SOBRE {nombre.split(' ')[0].toUpperCase()}</Text>
              <Text style={styles.descripcionCuerpo}>{descripcion}</Text>

              <Text style={[styles.seccionTitulo, { marginTop: 24 }]}>ESPECIALIDADES</Text>
              <View style={styles.chipsRow}>
                {workerMock.especialidades.map((esp, i) => (
                  <View key={i} style={styles.chip}>
                    <Text style={styles.chipTexto}>{esp}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {tabActivo === 'Reseñas' && (
            <View style={styles.seccion}>
              <Text style={styles.seccionTitulo}>OPINIONES DE CLIENTES</Text>
              {workerMock.reseñas.map((res) => (
                <View key={res.id} style={styles.resenaCard}>
                  <View style={styles.resenaHeader}>
                    <Text style={styles.resenaNombre}>{res.nombre}</Text>
                    <Text style={styles.resenaFecha}>{res.fecha}</Text>
                  </View>
                  <Text style={styles.resenaEstrellas}>{'★'.repeat(res.rating)}</Text>
                  <Text style={styles.resenaComentario}>{res.comentario}</Text>
                </View>
              ))}
            </View>
          )}

          {tabActivo === 'Servicios' && (
            <View style={styles.seccion}>
              <Text style={styles.seccionTitulo}>SERVICIOS Y TARIFAS</Text>
              {workerMock.especialidades.map((esp, i) => (
                <View key={i} style={styles.servicioRow}>
                  <View style={styles.servicioInfo}>
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                    <Text style={styles.servicioNombre}>{esp}</Text>
                  </View>
                  <Text style={styles.servicioTarifa}>Incluido</Text>
                </View>
              ))}

              <View style={styles.tarifaBaseCard}>
                <Text style={styles.tarifaBaseTitulo}>Visita y Presupuesto base desde</Text>
                <Text style={styles.tarifaBaseMonto}>${workerMock.precioBase} CLP</Text>
              </View>
            </View>
          )}

          {(solicitudPendiente || chatHabilitado) && (
            <TouchableOpacity 
              onPress={reiniciarSimulacion}
              style={styles.qaBoton}
            >
              <Text style={styles.qaBotonTexto}>Resetear simulación de estados</Text>
            </TouchableOpacity>
          )}
          
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* ── BOTONES FIJOS INFERIORES (FOOTER) ── */}
        <View style={styles.footer}>
          <TouchableOpacity 
            onPress={handleAbrirChat}
            style={[
              styles.footerBotonChat,
              chatHabilitado 
                ? styles.footerBotonChatHabilitado 
                : styles.footerBotonChatDeshabilitado
            ]}
            activeOpacity={chatHabilitado ? 0.7 : 1}
          >
            <Ionicons 
              name="chatbubble-ellipses" 
              size={24} 
              color={chatHabilitado ? COLORS.primary : COLORS.textMuted} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleSolicitarServicio}
            disabled={loading || solicitudPendiente}
            style={[
              styles.footerBotonSolicitar,
              loading 
                ? styles.footerBotonSolicitarCargando 
                : solicitudPendiente
                ? styles.footerBotonSolicitarPendiente
                : styles.footerBotonSolicitarActivo
            ]}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.btnRow}>
                <ActivityIndicator size="small" color="#9CA3AF" />
                <Text style={styles.btnTextoCargando}>Cargando...</Text>
              </View>
            ) : solicitudPendiente ? (
              <View style={styles.btnRow}>
                <Ionicons name="time-outline" size={20} color="#9CA3AF" />
                <Text style={styles.btnTextoDeshabilitado}>Solicitud Pendiente</Text>
              </View>
            ) : (
              <View style={styles.btnRow}>
                <Ionicons name="construct" size={20} color="#FFFFFF" />
                <Text style={styles.btnTextoActivo}>Solicitar Servicio</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  contenedorWebWeb: {
    width: '100%',
    maxWidth: 600, // Ancho máximo responsivo para tablets y monitores
    alignSelf: 'center',
    flex: 1,
    backgroundColor: '#FFFFFF',
    elevation: Platform.OS === 'web' ? 4 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'web' ? 0.08 : 0,
    shadowRadius: 10
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  loadingText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginTop: 12
  },
  loadingSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4
  },
  offlineBanner: {
    backgroundColor: '#D97706',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8
  },
  offlineBannerTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold'
  },
  header: {
    backgroundColor: HEADER_COLOR,
    paddingTop: 12,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16
  },
  headerBoton: {
    padding: 8,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  headerTitulo: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5
  },
  perfilInfoBox: {
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  avatarTexto: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900'
  },
  badgeVerificado: {
    backgroundColor: COLORS.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
    gap: 4,
    elevation: 1
  },
  badgeVerificadoTexto: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: 'bold'
  },
  nombreCompleto: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  oficioTexto: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    width: '100%',
    maxWidth: 320,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4
  },
  statBox: {
    flex: 1,
    alignItems: 'center'
  },
  statValor: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primary
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2
  },
  statSeparador: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border
  },
  ubicacionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 6
  },
  ubicacionTexto: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '500'
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#FFFFFF'
  },
  tabBoton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabBotonActivo: {
    borderBottomColor: COLORS.primary
  },
  tabTexto: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textMuted
  },
  tabTextoActivo: {
    color: COLORS.primary
  },
  scrollContent: {
    padding: 20
  },
  seccion: {
    flex: 1
  },
  seccionTitulo: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8
  },
  descripcionCuerpo: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  chipTexto: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700'
  },
  resenaCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 1
  },
  resenaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  resenaNombre: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  resenaFecha: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  resenaEstrellas: {
    color: '#FBBF24',
    fontSize: 12,
    marginTop: 2
  },
  resenaComentario: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: 6
  },
  servicioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  servicioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  servicioNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary
  },
  servicioTarifa: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500'
  },
  tarifaBaseCard: {
    backgroundColor: 'rgba(220, 252, 231, 0.4)',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 20
  },
  tarifaBaseTitulo: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  tarifaBaseMonto: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 4
  },
  qaBoton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12
  },
  qaBotonTexto: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
    fontWeight: '600'
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  footerBotonChat: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1
  },
  footerBotonChatHabilitado: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight
  },
  footerBotonChatDeshabilitado: {
    borderColor: COLORS.border,
    backgroundColor: '#F9FAFB'
  },
  footerBotonSolicitar: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4
  },
  footerBotonSolicitarActivo: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8
  },
  footerBotonSolicitarCargando: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 0
  },
  footerBotonSolicitarPendiente: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    elevation: 0
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  btnTextoActivo: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  btnTextoCargando: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  btnTextoDeshabilitado: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
