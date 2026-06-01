import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SHADOWS } from '../theme';

const HEADER_COLOR = '#41836c';

export default function ClientProfileScreen({ navigation }) {
  // ── MOCK DATA DEL CLIENTE ──
  const [clientData, setClientData] = useState({
    nombre: 'Benjamín',
    apellido: 'Cortés',
    correo: 'benjamin@worki.cl',
    telefono: '+56 9 8765 4321',
    fechaRegistro: '15 de Marzo, 2026',
    comuna: 'Providencia, Santiago',
    avatarColor: '#41836c',
    iniciales: 'BC'
  });

  // ── MOCK DATA DE LAS SOLICITUDES ──
  const [solicitudes, setSolicitudes] = useState([
    {
      id: 'sol_101',
      trabajadorNombre: 'Héctor Silva',
      oficio: 'Gasfíter',
      fecha: 'Hoy · 14:30',
      detalle: 'Reparación de calefont con filtración de agua.',
      estado: 'Pendiente',
      avatarColor: '#16A34A',
      iniciales: 'HS'
    },
    {
      id: 'sol_102',
      trabajadorNombre: 'Marta Gómez',
      oficio: 'Electricista',
      fecha: '28 de Mayo, 2026',
      detalle: 'Instalación de focos LED en terraza y reparación de enchufes.',
      estado: 'Finalizada',
      avatarColor: '#3B82F6',
      iniciales: 'MG'
    }
  ]);

  // ── ESTADOS DE EDICIÓN ──
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...clientData });

  // Guardar cambios del perfil
  const handleSaveProfile = () => {
    if (!editForm.nombre.trim() || !editForm.apellido.trim() || !editForm.correo.trim() || !editForm.telefono.trim()) {
      Alert.alert('Campos incompletos', 'Por favor rellena todos los datos del perfil.');
      return;
    }
    
    setClientData({
      ...editForm,
      iniciales: (editForm.nombre[0] || '') + (editForm.apellido[0] || '').toUpperCase()
    });
    setIsEditing(false);
    
    Alert.alert('Éxito', 'Tu perfil ha sido actualizado correctamente.');
  };

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar barStyle="light-content" backgroundColor={HEADER_COLOR} />
      
      {/* ── CONTENEDOR RESPONSIVO DE ANCHO MÁXIMO PARA REACT NATIVE WEB ── */}
      <View style={styles.contenedorWebWeb}>
        
        {/* ── HEADER SUPERIOR CON GRADIENTE DEL TEMA ── */}
        <View style={styles.header}>
          <View style={styles.headerBar}>
            <TouchableOpacity style={styles.headerBoton}>
              <Ionicons name="menu-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitulo}>Mi Cuenta</Text>
            <TouchableOpacity style={styles.headerBoton}>
              <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* ── PRESENTACIÓN CLIENTE ── */}
          <div style={styles.presentacionCliente}>
            <View 
              style={[styles.avatar, { backgroundColor: clientData.avatarColor }]}
            >
              <Text style={styles.avatarTexto}>{clientData.iniciales}</Text>
            </View>
            <Text style={styles.nombreCliente}>{clientData.nombre} {clientData.apellido}</Text>
            <View style={styles.badgeRol}>
              <Text style={styles.badgeRolTexto}>Cliente Worki</Text>
            </View>
          </div>
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
                  onClick={() => {
                    setEditForm({ ...clientData });
                    setIsEditing(true);
                  }}
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
                  <Text style={styles.inputLabel}>Correo Electrónico</Text>
                  <TextInput 
                    style={styles.textInput}
                    value={editForm.correo}
                    onChangeText={(val) => setEditForm({ ...editForm, correo: val })}
                    keyboardType="email-address"
                    autoCapitalize="none"
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
                
                <View style={styles.formAcciones}>
                  <TouchableOpacity 
                    onClick={handleSaveProfile}
                    style={styles.btnGuardar}
                  >
                    <Text style={styles.btnGuardarText}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onClick={() => setIsEditing(false)}
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
                  <Text style={styles.datoValor}>{clientData.correo}</Text>
                </View>
                <View style={styles.datoItem}>
                  <Text style={styles.datoLabel}>Teléfono de contacto</Text>
                  <Text style={styles.datoValor}>{clientData.telefono}</Text>
                </View>
                <View style={styles.datoItem}>
                  <Text style={styles.datoLabel}>Ubicación principal</Text>
                  <Text style={styles.datoValorSecundario}>{clientData.comuna}</Text>
                </View>
                <View style={styles.datoItem}>
                  <Text style={styles.datoLabel}>Miembro desde</Text>
                  <Text style={styles.datoValorSecundario}>{clientData.fechaRegistro}</Text>
                </View>
              </View>
            )}
          </View>

          {/* 📋 SECCIÓN 2: MIS SOLICITUDES */}
          <View style={styles.solicitudesContainer}>
            <Text style={styles.seccionTituloText}>Mis Solicitudes</Text>

            <View style={styles.solicitudesLista}>
              {solicitudes.map((sol) => {
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
                          <TouchableOpacity style={styles.btnSecundarioNativo}>
                            <Text style={styles.btnSecundarioNativoText}>Cancelar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.btnPrimarioNativo}>
                            <Text style={styles.btnPrimarioNativoText}>Ver Chat</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          <TouchableOpacity style={styles.btnSecundarioNativo}>
                            <Text style={styles.btnSecundarioNativoText}>Ver Recibo</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.btnPrimarioNativoAlerta}>
                            <Text style={styles.btnPrimarioNativoAlertaText}>Calificar</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                );
              })}
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
    alignItems: 'start'
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
