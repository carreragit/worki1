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
import { API_BASE_URL } from '../services/config';

const HEADER_COLOR = '#41836c'; // Color base del gradiente de Worki

export default function WorkerProfileScreen({ route, navigation }) {
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

  // ── CONSUMO DEL API GATEWAY (MÓDULO USER-SERVICE Y INTERACTION-SERVICE) ──
  useEffect(() => {
    const oficioId = route?.params?.oficioId || route?.params?.id || route?.params?.worker?.id || 1;
    const clienteId = 1; // ID del cliente por defecto
    
    setIsFetchingProfile(true);
    setErrorFetch(false);

    // 1. Obtener los detalles del oficio usando la URL centralizada
    fetch(`${API_BASE_URL}/oficios/${oficioId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP Error Status: ${response.status}`);
        }
        return response.json();
      })
      .then(async (oficioData) => {
        try {
          // 2. Obtener los detalles del trabajador
          let trabajadorData = {};
          if (oficioData.trabajadorId) {
            const trabajadorRes = await fetch(`${API_BASE_URL}/trabajadores/${oficioData.trabajadorId}`);
            if (trabajadorRes.ok) {
              trabajadorData = await trabajadorRes.json();
            }
          }

          // 3. Obtener el perfil asociado
          const perfilId = trabajadorData.perfilId || oficioData.trabajadorId || 2;
          let perfilData = {};
          const perfilRes = await fetch(`${API_BASE_URL}/perfiles/${perfilId}`);
          if (perfilRes.ok) {
            perfilData = await perfilRes.json();
          }

          // Fusionar información
          const merged = {
            ...oficioData,
            ...trabajadorData,
            ...perfilData,
            comuna: perfilData.ciudad || perfilData.comuna || 'Providencia',
            disponibilidadInmediata: trabajadorData.disponibilidadInmediata ?? false,
          };

          // 4. Obtener calificaciones (opiniones) del trabajador
          let reviews = [];
          try {
            const calRes = await fetch(`${API_BASE_URL}/interacciones/calificaciones/usuario/${perfilId}`);
            if (calRes.ok) {
              const calList = await calRes.json();
              reviews = await Promise.all(
                calList.map(async (cal) => {
                  let evaluatorName = 'Cliente Anónimo';
                  try {
                    const evalRes = await fetch(`${API_BASE_URL}/perfiles/${cal.evaluadorId}`);
                    if (evalRes.ok) {
                      const evalProfile = await evalRes.json();
                      evaluatorName = evalProfile.nombreCompleto || evaluatorName;
                    }
                  } catch (e) {
                    console.warn('Error fetching evaluator profile:', e);
                  }

                  let fechaStr = 'Reciente';
                  if (cal.createdAt) {
                    const d = new Date(cal.createdAt);
                    fechaStr = d.toLocaleDateString('es-CL', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });
                  }

                  return {
                    id: cal.id,
                    nombre: evaluatorName,
                    rating: cal.puntaje || 5,
                    fecha: fechaStr,
                    comentario: cal.comentario || ''
                  };
                })
              );
            }
          } catch (calErr) {
            console.warn('Error al obtener calificaciones:', calErr);
          }

          merged.reseñas = reviews;
          setWorkerData(merged);

          // 5. Verificar si hay solicitudes pendientes o activas
          try {
            const solsRes = await fetch(`${API_BASE_URL}/interacciones/solicitudes/cliente/${clienteId}`);
            if (solsRes.ok) {
              const sols = await solsRes.json();
              const tienePendiente = sols.some(sol => 
                (sol.oficioId === oficioId || sol.trabajadorId === oficioData.trabajadorId) &&
                (sol.estado === 'PENDIENTE')
              );
              setSolicitudPendiente(tienePendiente);
              
              const tieneChat = sols.some(sol => 
                (sol.oficioId === oficioId || sol.trabajadorId === oficioData.trabajadorId) &&
                (sol.estado === 'ACEPTADA' || sol.estado === 'COMPLETADA')
              );
              setChatHabilitado(tieneChat);
            }
          } catch (solsErr) {
            console.warn('Error al verificar solicitudes previas:', solsErr);
          }

        } catch (innerErr) {
          console.error('Error al resolver recursos secundarios:', innerErr);
          setErrorFetch(true);
        } finally {
          setIsFetchingProfile(false);
        }
      })
      .catch(error => {
        console.error('Conexión con Gateway fallida:', error);
        setErrorFetch(true);
        setIsFetchingProfile(false);
      });
  }, [route?.params?.oficioId, route?.params?.id, route?.params?.worker?.id]);

  // ── MAPEADO DINÁMICO DE CAMPOS ──
  const nombre = workerData?.nombreCompleto || workerData?.nombre || 'Profesional';
  const descripcion = workerData?.descripcionServicio || workerData?.descripcion || 'Sin descripción disponible.';
  const comuna = workerData?.comuna || workerData?.ciudad || 'No especificada';
  const iniciales = nombre
    ? nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'TR';

  const especialidades = workerData?.especialidades || 
    (workerData?.especialidad ? [workerData.especialidad] : ['Servicios Generales']);

  const handleSolicitarServicio = () => {
    if (solicitudPendiente || loading) return;
    
    setLoading(true);
    
    const clienteId = 1; // default cliente autenticado
    const POST_SOLICITUD_URL = `${API_BASE_URL}/interacciones/solicitudes`;

    const requestBody = {
      trabajadorId: workerData?.trabajadorId || 1,
      oficioId: workerData?.id || 1,
      descripcion: `Solicitud de servicio de ${workerData?.especialidad || 'profesional'} desde app móvil.`,
      fechaHoraPreferida: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('.')[0], // Mañana a esta hora
      direccion: 'Dirección del cliente registrado',
      clienteLatitud: -33.4372,
      clienteLongitud: -70.6506
    };

    fetch(POST_SOLICITUD_URL, {
      method: 'POST',
      headers: {
        'X-User-Id': clienteId.toString(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(text || 'Error al enviar solicitud');
          });
        }
        return response.json();
      })
      .then(() => {
        setLoading(false);
        setSolicitudPendiente(true);
        Alert.alert('Éxito', 'Tu solicitud de servicio ha sido enviada con éxito. Espera a que el técnico la acepte.');
      })
      .catch(error => {
        console.error('Error al enviar solicitud:', error);
        Alert.alert('Error', error.message || 'No se pudo enviar la solicitud.');
        setLoading(false);
      });
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

  // Estado de Carga: Muestra exclusivamente un ActivityIndicator nativo centrado.
  if (isFetchingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar barStyle="light-content" backgroundColor={HEADER_COLOR} />
      
      {/* ── CONTENEDOR RESPONSIVO DE ANCHO MÁXIMO PARA REACT NATIVE WEB ── */}
      <View style={styles.contenedorWebWeb}>
      
        {errorFetch && (
          <View style={styles.offlineBanner}>
            <Ionicons name="warning-outline" size={16} color="#FFFFFF" />
            <Text style={styles.offlineBannerTexto}>Error de Conexión: No se pudieron cargar los datos reales</Text>
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
            <View style={[styles.avatar, { backgroundColor: workerData?.avatarColor || '#41836c' }]}>
              <Text style={styles.avatarTexto}>{iniciales}</Text>
            </View>

            <View style={styles.badgeVerificado}>
              <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
              <Text style={styles.badgeVerificadoTexto}>Identidad Verificada</Text>
            </View>

            {/* Mostrar badge de Disponibilidad Inmediata si corresponde */}
            {workerData?.disponibilidadInmediata && (
              <View style={[styles.badgeVerificado, { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0', borderWidth: 1, marginTop: 8 }]}>
                <Ionicons name="flash" size={12} color="#16A34A" />
                <Text style={[styles.badgeVerificadoTexto, { color: '#16A34A' }]}>Disponible Ahora</Text>
              </View>
            )}

            <Text style={styles.nombreCompleto}>{nombre}</Text>
            <Text style={styles.oficioTexto}>{workerData?.especialidad || workerData?.oficio || 'Profesional'} Certificado</Text>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValor}>★ {workerData?.promedioCalificacion || workerData?.rating || '0.0'}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statSeparador} />
              <View style={styles.statBox}>
                <Text style={styles.statValor}>{workerData?.totalCalificaciones || workerData?.reseñasCount || 0}</Text>
                <Text style={styles.statLabel}>Reseñas</Text>
              </View>
              <View style={styles.statSeparador} />
              <View style={styles.statBox}>
                <Text style={styles.statValor}>{workerData?.experiencia || 'N/A'}</Text>
                <Text style={styles.statLabel}>Exp.</Text>
              </View>
            </View>

            <View style={styles.ubicacionRow}>
              <Ionicons name="location-sharp" size={14} color="#FFFFFF" />
              <Text style={styles.ubicacionTexto}>
                {comuna} {workerData?.radioKm ? `· Cobertura ${workerData.radioKm} km` : ''}
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
                {especialidades.map((esp, i) => (
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
              {workerData?.reseñas && workerData.reseñas.length > 0 ? (
                workerData.reseñas.map((res) => (
                  <View key={res.id} style={styles.resenaCard}>
                    <View style={styles.resenaHeader}>
                      <Text style={styles.resenaNombre}>{res.nombre}</Text>
                      <Text style={styles.resenaFecha}>{res.fecha}</Text>
                    </View>
                    <Text style={styles.resenaEstrellas}>{'★'.repeat(res.rating)}</Text>
                    <Text style={styles.resenaComentario}>{res.comentario}</Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginTop: 20 }}>
                  Aún no hay opiniones para este profesional.
                </Text>
              )}
            </View>
          )}

          {tabActivo === 'Servicios' && (
            <View style={styles.seccion}>
              <Text style={styles.seccionTitulo}>SERVICIOS Y TARIFAS</Text>
              {especialidades.map((esp, i) => (
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
                <Text style={styles.tarifaBaseMonto}>
                  ${workerData?.tarifaServicioBase || workerData?.precioBase || '0'} CLP
                </Text>
              </View>
            </View>
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
  offlineBanner: {
    backgroundColor: '#DC2626',
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
