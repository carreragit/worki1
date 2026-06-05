import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { API_BASE_URL } from '../services/config';
import { useUser } from '../context/UserContext';
import { getToken } from '../services/authService';

const HEADER_COLOR = '#41836c';

export default function ClientProfileScreen({ navigation }) {
  const { user } = useUser();

  // ── ESTADOS DE LA INTEGRACIÓN CON BACKEND (API GATEWAY) ──
  const [clientData, setClientData] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  // ── ESTADOS DE EDICIÓN ──
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    comuna: ''
  });

  // ── CONSUMO DEL API GATEWAY (MÓDULOS USER-SERVICE E INTERACTION-SERVICE) ──
  useEffect(() => {
    const clienteId = user?.perfilId;
    if (!clienteId) return;

    const PROFILE_URL = `${API_BASE_URL}/perfiles/${clienteId}`;
    const SOLICITUDES_URL = `${API_BASE_URL}/interacciones/solicitudes/cliente/${clienteId}`;

    setIsFetching(true);

    const fetchWithAuth = async (url) => {
      const token = await getToken();
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return res.json();
    };

    Promise.all([
      fetchWithAuth(PROFILE_URL),
      fetchWithAuth(SOLICITUDES_URL),
    ])
      .then(async ([profile, sols]) => {
        setClientData(profile);
        
        // Enriquecer solicitudes con el nombre del trabajador y su especialidad
        const enrichedSols = await Promise.all(
          sols.map(async (sol) => {
            try {
              // 1. Obtener detalles del oficio
              let oficioInfo = { especialidad: 'Profesional' };
              if (sol.oficioId) {
                const oficioRes = await fetch(`${API_BASE_URL}/oficios/${sol.oficioId}`);
                if (oficioRes.ok) {
                  oficioInfo = await oficioRes.json();
                }
              }

              // 2. Obtener detalles del trabajador (para buscar su perfilId)
              let workerProfile = { nombreCompleto: `Trabajador #${sol.trabajadorId}` };
              if (sol.trabajadorId) {
                const workerRes = await fetch(`${API_BASE_URL}/trabajadores/${sol.trabajadorId}`);
                if (workerRes.ok) {
                  const workerData = await workerRes.json();
                  if (workerData?.perfilId) {
                    const perfilRes = await fetch(`${API_BASE_URL}/perfiles/${workerData.perfilId}`);
                    if (perfilRes.ok) {
                      workerProfile = await perfilRes.json();
                    }
                  }
                }
              }

              // Dar formato a la fecha de creación
              let fechaStr = 'Reciente';
              if (sol.createdAt) {
                const date = new Date(sol.createdAt);
                fechaStr = date.toLocaleDateString('es-CL', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              }

              const nombreComp = workerProfile.nombreCompleto || '';
              const iniciales = nombreComp
                ? nombreComp.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                : 'TR';

              return {
                id: sol.id.toString(),
                trabajadorNombre: nombreComp,
                oficio: oficioInfo.especialidad || 'Profesional',
                fecha: fechaStr,
                detalle: sol.descripcion || 'Sin descripción',
                estado: sol.estado ? (sol.estado.charAt(0) + sol.estado.slice(1).toLowerCase()) : 'Pendiente',
                avatarColor: '#16A34A',
                iniciales: iniciales
              };
            } catch (err) {
              console.warn('Error al enriquecer solicitud:', err);
              return {
                id: sol.id.toString(),
                trabajadorNombre: `Trabajador #${sol.trabajadorId}`,
                oficio: 'Profesional',
                fecha: 'Reciente',
                detalle: sol.descripcion || 'Sin descripción',
                estado: sol.estado ? (sol.estado.charAt(0) + sol.estado.slice(1).toLowerCase()) : 'Pendiente',
                avatarColor: '#9CA3AF',
                iniciales: 'TR'
              };
            }
          })
        );

        setSolicitudes(enrichedSols);
        setIsFetching(false);
      })
      .catch(error => {
        console.error('Error al conectar con el servidor:', error);
        Alert.alert('Error', 'No se pudo obtener la información de perfil.');
        setIsFetching(false);
      });
  }, [user?.perfilId]);

  const handleEditPress = () => {
    const names = clientData?.nombreCompleto?.split(' ') || [];
    const nombre = names[0] || '';
    const apellido = names.slice(1).join(' ') || '';
    setEditForm({
      nombre: nombre,
      apellido: apellido,
      correo: clientData?.correo || 'correo@worki.cl',
      telefono: clientData?.telefono || '',
      comuna: clientData?.comuna || clientData?.ciudad || ''
    });
    setIsEditing(true);
  };

  // Guardar cambios del perfil
  const handleSaveProfile = async () => {
    if (!editForm.nombre.trim() || !editForm.apellido.trim() || !editForm.telefono.trim()) {
      Alert.alert('Campos incompletos', 'Por favor rellena todos los datos del perfil.');
      return;
    }

    const clienteId = user?.perfilId;
    const PROFILE_UPDATE_URL = `${API_BASE_URL}/perfiles/${clienteId}`;
    const nombreCompleto = `${editForm.nombre.trim()} ${editForm.apellido.trim()}`;
    const token = await getToken();

    const requestBody = {
      usuarioId: clientData?.usuarioId || user?.userId,
      nombreCompleto,
      telefono: editForm.telefono.trim(),
      ciudad: editForm.comuna.trim(),
      region: clientData?.region || 'Metropolitana',
      descripcion: clientData?.descripcion || 'Cliente registrado activo para solicitud de servicios del hogar.',
      fotoPerfil: clientData?.fotoPerfil || null,
      fechaNacimiento: clientData?.fechaNacimiento || null
    };

    setIsFetching(true);

    fetch(PROFILE_UPDATE_URL, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al actualizar perfil');
        }
        return response.json();
      })
      .then(updatedProfile => {
        setClientData(updatedProfile);
        setIsEditing(false);
        setIsFetching(false);
        Alert.alert('Éxito', 'Tu perfil ha sido actualizado correctamente.');
      })
      .catch(error => {
        console.error('Error al guardar perfil:', error);
        Alert.alert('Error', 'No se pudo guardar la información del perfil.');
        setIsFetching(false);
      });
  };

  // Mapear iniciales del cliente
  const iniciales = clientData?.nombreCompleto
    ? clientData.nombreCompleto.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'CL';

  // Mostrar exclusivamente ActivityIndicator nativo centrado durante la carga
  if (isFetching) {
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
        
        {/* ── HEADER SUPERIOR CON GRADIENTE DEL TEMA ── */}
        <View style={styles.header}>
          <View style={styles.headerBar}>
            <TouchableOpacity style={styles.headerBoton} onPress={() => navigation && navigation.goBack()}>
              <Ionicons name="arrow-back-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitulo}>Mi Cuenta</Text>
            <TouchableOpacity style={styles.headerBoton} onPress={() => Alert.alert('Sesión', 'Cerrando sesión...')}>
              <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* ── PRESENTACIÓN CLIENTE ── */}
          <View style={styles.presentacionCliente}>
            <View 
              style={[styles.avatar, { backgroundColor: clientData?.avatarColor || '#41836c' }]}
            >
              <Text style={styles.avatarTexto}>{iniciales}</Text>
            </View>
            <Text style={styles.nombreCliente}>{clientData?.nombreCompleto || ''}</Text>
            <View style={styles.badgeRol}>
              <Text style={styles.badgeRolTexto}>Cliente Worki</Text>
            </View>
          </View>
        </View>

        {/* ── SECCIONES (SCROLLABLE) ── */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 🔍 SECCIÓN 1: MIS DATOS / FORMULARIO EDICIÓN */}
          <View style={styles.tarjeta}>
            <View style={styles.tarjetaHeader}>
              <View style={styles.tarjetaHeaderTituloCol}>
                <Ionicons name="person-outline" size={18} color={COLORS.primary} />
                <Text style={styles.tarjetaTituloText}>Mis Datos</Text>
              </View>
              
              {!isEditing && (
                <TouchableOpacity 
                  onPress={handleEditPress}
                  style={styles.btnEditar}
                >
                  <Text style={styles.btnEditarText}>Editar Perfil</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* MODO FORMULARIO EDICIÓN */}
            {isEditing ? (
              <View style={styles.formContainer}>
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Nombre</Text>
                  <TextInput 
                    style={styles.textInput}
                    value={editForm.nombre}
                    onChangeText={(val) => setEditForm({ ...editForm, nombre: val })}
                    placeholder="Nombre"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Apellido</Text>
                  <TextInput 
                    style={styles.textInput}
                    value={editForm.apellido}
                    onChangeText={(val) => setEditForm({ ...editForm, apellido: val })}
                    placeholder="Apellido"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Correo Electrónico (Solo Lectura)</Text>
                  <TextInput 
                    style={[styles.textInput, { backgroundColor: '#E5E7EB', color: '#6B7280' }]}
                    value={editForm.correo}
                    editable={false}
                    placeholder="ejemplo@worki.cl"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Teléfono</Text>
                  <TextInput 
                    style={styles.textInput}
                    value={editForm.telefono}
                    onChangeText={(val) => setEditForm({ ...editForm, telefono: val })}
                    keyboardType="phone-pad"
                    placeholder="+56 9 1234 5678"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Comuna / Ciudad</Text>
                  <TextInput 
                    style={styles.textInput}
                    value={editForm.comuna}
                    onChangeText={(val) => setEditForm({ ...editForm, comuna: val })}
                    placeholder="Providencia, Santiago"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
                
                <View style={styles.formAcciones}>
                  <TouchableOpacity 
                    onPress={handleSaveProfile}
                    style={styles.btnGuardar}
                  >
                    <Text style={styles.btnGuardarText}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setIsEditing(false)}
                    style={styles.btnCancelar}
                  >
                    <Text style={styles.btnCancelarText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // MODO VISTA DE DATOS
              <View style={styles.datosGrid}>
                <View style={styles.datoItem}>
                  <Text style={styles.datoLabel}>Correo Electrónico</Text>
                  <Text style={styles.datoValor}>{clientData?.correo || 'correo@worki.cl'}</Text>
                </View>
                <View style={styles.datoItem}>
                  <Text style={styles.datoLabel}>Teléfono de contacto</Text>
                  <Text style={styles.datoValor}>{clientData?.telefono || 'No registrado'}</Text>
                </View>
                <View style={styles.datoItem}>
                  <Text style={styles.datoLabel}>Ubicación principal</Text>
                  <Text style={styles.datoValorSecundario}>{clientData?.comuna || clientData?.ciudad || 'No registrada'}</Text>
                </View>
                <View style={styles.datoItem}>
                  <Text style={styles.datoLabel}>Miembro desde</Text>
                  <Text style={styles.datoValorSecundario}>
                    {clientData?.fechaCreacion
                      ? new Date(clientData.fechaCreacion).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
                      : 'No disponible'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* 📋 SECCIÓN 2: MIS SOLICITUDES */}
          <View style={styles.solicitudesContainer}>
            <Text style={styles.seccionTituloText}>Mis Solicitudes</Text>

            <View style={styles.solicitudesLista}>
              {solicitudes && solicitudes.length > 0 ? (
                solicitudes.map((sol) => {
                  const isPendiente = sol.estado === 'Pendiente';
                  
                  return (
                    <View key={sol.id} style={styles.solicitudCard}>
                      {/* Encabezado solicitud */}
                      <View style={styles.solicitudHeader}>
                        <View style={styles.solicitudPerfilRow}>
                          <View 
                            style={[styles.solicitudAvatar, { backgroundColor: sol.avatarColor }]}
                          >
                            <Text style={styles.solicitudAvatarText}>{sol.iniciales}</Text>
                          </View>
                          <View>
                            <Text style={styles.solicitudTrabajadorNombre}>{sol.trabajadorNombre}</Text>
                            <Text style={styles.solicitudSubtext}>{sol.oficio} · {sol.fecha}</Text>
                          </View>
                        </View>
                        
                        {/* Estado Badge */}
                        <View style={[
                          styles.estadoBadge,
                          isPendiente ? styles.estadoBadgePendiente : styles.estadoBadgeFinalizada
                        ]}>
                          <Text style={[
                            styles.estadoBadgeTexto,
                            isPendiente ? styles.estadoBadgeTextoPendiente : styles.estadoBadgeTextoFinalizada
                          ]}>
                            {sol.estado}
                          </Text>
                        </View>
                      </View>

                      {/* Descripción de servicio */}
                      <View style={styles.solicitudCuerpoBox}>
                        <Text style={styles.solicitudCuerpoLabel}>Descripción del servicio:</Text>
                        <Text style={styles.solicitudCuerpoTexto}>{sol.detalle}</Text>
                      </View>

                      {/* Botones contextuales */}
                      <View style={styles.solicitudAccionesRow}>
                        {isPendiente ? (
                          <>
                            <TouchableOpacity style={styles.btnSecundarioNativo} onPress={() => Alert.alert('Cancelar', 'Cancelando solicitud...')}>
                              <Text style={styles.btnSecundarioNativoText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnPrimarioNativo} onPress={() => Alert.alert('Chat', 'Abriendo chat...')}>
                              <Text style={styles.btnPrimarioNativoText}>Ver Chat</Text>
                            </TouchableOpacity>
                          </>
                        ) : (
                          <>
                            <TouchableOpacity style={styles.btnSecundarioNativo} onPress={() => Alert.alert('Recibo', 'Cargando recibo...')}>
                              <Text style={styles.btnSecundarioNativoText}>Ver Recibo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnPrimarioNativoAlerta} onPress={() => Alert.alert('Calificar', 'Calificando servicio...')}>
                              <Text style={styles.btnPrimarioNativoAlertaText}>Calificar</Text>
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={{ color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginTop: 20 }}>
                  No tienes solicitudes de servicio registradas.
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
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
  presentacionCliente: {
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
  nombreCliente: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 10
  },
  badgeRol: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6
  },
  badgeRolTexto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold'
  },
  scrollContent: {
    padding: 20
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6
  },
  tarjetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
    marginBottom: 16
  },
  tarjetaHeaderTituloCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  tarjetaTituloText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary
  },
  btnEditar: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  btnEditarText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: 'bold'
  },
  datosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 16
  },
  datoItem: {
    width: '50%',
    paddingRight: 8
  },
  datoLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  datoValor: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 2
  },
  datoValorSecundario: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2
  },
  formContainer: {
    gap: 12
  },
  formGroup: {
    gap: 4
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textSecondary
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: '#F9FAFB'
  },
  formAcciones: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8
  },
  btnGuardar: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4
  },
  btnGuardarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold'
  },
  btnCancelar: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  btnCancelarText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: 'bold'
  },
  solicitudesContainer: {
    marginTop: 24,
    gap: 12
  },
  seccionTituloText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
    paddingLeft: 4
  },
  solicitudesLista: {
    gap: 12
  },
  solicitudCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4
  },
  solicitudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  solicitudPerfilRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  solicitudAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  solicitudAvatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold'
  },
  solicitudTrabajadorNombre: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  solicitudSubtext: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500'
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1
  },
  estadoBadgePendiente: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderColor: 'rgba(251, 191, 36, 0.4)'
  },
  estadoBadgeFinalizada: {
    backgroundColor: COLORS.primaryLight,
    borderColor: '#BBF7D0'
  },
  estadoBadgeTexto: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  estadoBadgeTextoPendiente: {
    color: '#D97706'
  },
  estadoBadgeTextoFinalizada: {
    color: COLORS.primary
  },
  solicitudCuerpoBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  solicitudCuerpoLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textSecondary
  },
  solicitudCuerpoTexto: {
    fontSize: 12,
    color: COLORS.textPrimary,
    lineHeight: 18,
    marginTop: 2,
    fontWeight: '500'
  },
  solicitudAccionesRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8
  },
  btnSecundarioNativo: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF'
  },
  btnSecundarioNativoText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 'bold'
  },
  btnPrimarioNativo: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12
  },
  btnPrimarioNativoText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold'
  },
  btnPrimarioNativoAlerta: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12
  },
  btnPrimarioNativoAlertaText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: 'bold'
  }
});
