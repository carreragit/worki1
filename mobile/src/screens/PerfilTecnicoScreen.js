/**
 * PerfilTecnicoScreen
 *
 * Pantalla compartida para clientes y el propio trabajador.
 * - Clientes: ven info, oficios, reseñas. Pueden contactar.
 * - Trabajador (esMiPerfil): además pueden editar oficio, toggle activo, agregar oficio.
 *
 * El selector de oficio arriba permite cambiar entre los servicios del trabajador.
 * Las reseñas se filtran por el oficio seleccionado.
 */
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator,
  Switch, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { getToken } from '../services/authService';
import { listarPorOficio } from '../services/calificacionService';
import { actualizarOficio, cambiarActivoOficio, crearOficio } from '../services/userService';
import { COLORS, AVATAR_COLORS } from '../theme';
import { GATEWAY_URL } from '../services/config';

const TABS = ['Información', 'Servicios', 'Reseñas'];

export default function PerfilTecnicoScreen({ route, navigation }) {
  const { oficio: oficioInicial } = route.params;
  const { user } = useUser();

  const [tabActivo, setTabActivo]                 = useState('Información');
  const [oficios, setOficios]                     = useState([oficioInicial]);
  const [oficioSeleccionado, setOficioSeleccionado] = useState(oficioInicial);
  const [dropdownVisible, setDropdownVisible]     = useState(false);
  const [cargando, setCargando]                   = useState(true);
  const [resenas, setResenas]                     = useState([]);

  // Estado edición oficio
  const [editandoOficio, setEditandoOficio]       = useState(false);
  const [guardandoOficio, setGuardandoOficio]     = useState(false);
  const [editForm, setEditForm]                   = useState({});

  // Estado agregar oficio
  const [mostrarFormNuevo, setMostrarFormNuevo]   = useState(false);
  const [guardandoNuevo, setGuardandoNuevo]       = useState(false);
  const [nuevoForm, setNuevoForm]                 = useState({
    especialidad: '', nombreServicio: '', descripcion: '', tarifaHora: '', tarifaBase: '',
  });

  const esMiPerfil = user.trabajadorId != null &&
    user.trabajadorId === oficioSeleccionado.trabajadorId;

  useFocusEffect(useCallback(() => {
    cargarOficios();
  }, []));

  // Recarga reseñas cuando cambia el oficio seleccionado
  useFocusEffect(useCallback(() => {
    cargarResenas(oficioSeleccionado.id);
  }, [oficioSeleccionado.id]));

  const cargarOficios = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${GATEWAY_URL}/api/oficios/trabajador/${oficioInicial.trabajadorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOficios(res.data);
      // Mantiene el oficio seleccionado actualizado con datos frescos del backend
      const fresco = res.data.find(o => o.id === oficioSeleccionado.id) ?? res.data[0];
      if (fresco) setOficioSeleccionado(fresco);
    } catch {
      // Si falla, se mantiene el oficio inicial que vino por parámetro
    } finally {
      setCargando(false);
    }
  };

  const cargarResenas = async (oficioId) => {
    try {
      const data = await listarPorOficio(oficioId);
      setResenas(data);
    } catch {
      setResenas([]);
    }
  };

  const handleSeleccionarOficio = (oficio) => {
    setOficioSeleccionado(oficio);
    setDropdownVisible(false);
    setEditandoOficio(false);
    cargarResenas(oficio.id);
  };

  const handleEditarOficio = () => {
    setEditForm({
      especialidad:        oficioSeleccionado.especialidad ?? '',
      nombreServicio:      oficioSeleccionado.nombreServicio ?? '',
      descripcionServicio: oficioSeleccionado.descripcionServicio ?? '',
      tarifaHora:          oficioSeleccionado.tarifaHora?.toString() ?? '',
      tarifaServicioBase:  oficioSeleccionado.tarifaServicioBase?.toString() ?? '',
    });
    setEditandoOficio(true);
  };

  const handleGuardarOficio = async () => {
    if (!editForm.especialidad.trim() || !editForm.nombreServicio.trim()) {
      Alert.alert('Campos requeridos', 'Especialidad y nombre del servicio son obligatorios.');
      return;
    }
    setGuardandoOficio(true);
    try {
      const actualizado = await actualizarOficio(oficioSeleccionado.id, {
        trabajadorId:        oficioSeleccionado.trabajadorId,
        especialidad:        editForm.especialidad.trim(),
        nombreServicio:      editForm.nombreServicio.trim(),
        descripcionServicio: editForm.descripcionServicio.trim() || null,
        tarifaHora:          editForm.tarifaHora ? Number(editForm.tarifaHora) : null,
        tarifaServicioBase:  editForm.tarifaServicioBase ? Number(editForm.tarifaServicioBase) : null,
      });
      setOficioSeleccionado(actualizado);
      setOficios(prev => prev.map(o => o.id === actualizado.id ? actualizado : o));
      setEditandoOficio(false);
    } catch {
      Alert.alert('Error', 'No se pudo guardar el oficio.');
    } finally {
      setGuardandoOficio(false);
    }
  };

  const handleToggleActivo = async (oficio) => {
    try {
      const actualizado = await cambiarActivoOficio(oficio.id, !oficio.activo);
      setOficios(prev => prev.map(o => o.id === actualizado.id ? actualizado : o));
      if (oficio.id === oficioSeleccionado.id) setOficioSeleccionado(actualizado);
    } catch {
      Alert.alert('Error', 'No se pudo cambiar el estado del oficio.');
    }
  };

  const handleAgregarOficio = async () => {
    if (!nuevoForm.especialidad.trim() || !nuevoForm.nombreServicio.trim()) {
      Alert.alert('Campos requeridos', 'Especialidad y nombre del servicio son obligatorios.');
      return;
    }
    setGuardandoNuevo(true);
    try {
      const nuevo = await crearOficio({
        trabajadorId:        oficioSeleccionado.trabajadorId,
        especialidad:        nuevoForm.especialidad.trim(),
        nombreServicio:      nuevoForm.nombreServicio.trim(),
        descripcionServicio: nuevoForm.descripcion.trim() || null,
        tarifaHora:          nuevoForm.tarifaHora ? Number(nuevoForm.tarifaHora) : null,
        tarifaServicioBase:  nuevoForm.tarifaBase ? Number(nuevoForm.tarifaBase) : null,
      });
      setOficios(prev => [...prev, nuevo]);
      setOficioSeleccionado(nuevo);
      setMostrarFormNuevo(false);
      setNuevoForm({ especialidad: '', nombreServicio: '', descripcion: '', tarifaHora: '', tarifaBase: '' });
      cargarResenas(nuevo.id);
    } catch {
      Alert.alert('Error', 'No se pudo crear el oficio.');
    } finally {
      setGuardandoNuevo(false);
    }
  };

  const color = AVATAR_COLORS[oficioInicial.trabajadorId % AVATAR_COLORS.length];
  const iniciales = oficioInicial.nombreTrabajador
    ? oficioInicial.nombreTrabajador.trim().split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('')
    : '?';

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnAtras}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Perfil del técnico</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* AVATAR Y STATS */}
        <View style={styles.perfilBloque}>
          <View style={[styles.avatar, { backgroundColor: color }]}>
            <Text style={styles.avatarTexto}>{iniciales}</Text>
          </View>
          <Text style={styles.nombre}>{oficioInicial.nombreTrabajador ?? 'Técnico'}</Text>
          <Text style={styles.oficio}>{oficioSeleccionado.especialidad}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValor}>★ {oficioSeleccionado.promedioCalificacion?.toFixed(1) ?? 'N/A'}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.separador} />
            <View style={styles.statItem}>
              <Text style={styles.statValor}>{oficioSeleccionado.totalCalificaciones ?? 0}</Text>
              <Text style={styles.statLabel}>Reseñas</Text>
            </View>
            <View style={styles.separador} />
            <View style={styles.statItem}>
              <Text style={styles.statValor}>{oficioInicial.radioKm ?? '?'} km</Text>
              <Text style={styles.statLabel}>Radio</Text>
            </View>
          </View>
        </View>

        {/* SELECTOR DE OFICIO */}
        <View style={styles.selectorContainer}>
          <TouchableOpacity
            style={styles.selectorBtn}
            onPress={() => setDropdownVisible(v => !v)}
          >
            <Text style={styles.selectorTexto} numberOfLines={1}>
              {oficioSeleccionado.nombreServicio ?? oficioSeleccionado.especialidad}
            </Text>
            <View style={styles.selectorBadgeRow}>
              {!oficioSeleccionado.activo && (
                <View style={styles.badgeInactivo}>
                  <Text style={styles.badgeInactivoTexto}>Inactivo</Text>
                </View>
              )}
              <Ionicons
                name={dropdownVisible ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={COLORS.textSecondary}
              />
            </View>
          </TouchableOpacity>

          {dropdownVisible && (
            <View style={styles.dropdownLista}>
              {oficios.map(o => (
                <TouchableOpacity
                  key={o.id}
                  style={[styles.dropdownItem, o.id === oficioSeleccionado.id && styles.dropdownItemActivo]}
                  onPress={() => handleSeleccionarOficio(o)}
                >
                  <Text style={[styles.dropdownItemTexto, o.id === oficioSeleccionado.id && styles.dropdownItemTextoActivo]}>
                    {o.nombreServicio ?? o.especialidad}
                  </Text>
                  {!o.activo && <Text style={styles.dropdownInactivoLabel}>(inactivo)</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* TABS */}
        <View style={styles.tabsRow}>
          {TABS.map(tab => (
            <TouchableOpacity key={tab} onPress={() => setTabActivo(tab)}
              style={[styles.tab, tabActivo === tab && styles.tabActivo]}>
              <Text style={[styles.tabTexto, tabActivo === tab && styles.tabTextoActivo]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabContenido}>

          {/* TAB: INFORMACIÓN */}
          {tabActivo === 'Información' && (
            <>
              {esMiPerfil && !editandoOficio && (
                <TouchableOpacity style={styles.btnEditar} onPress={handleEditarOficio}>
                  <Text style={styles.btnEditarTexto}>Editar</Text>
                </TouchableOpacity>
              )}

              {editandoOficio ? (
                <View style={styles.formContainer}>
                  <Text style={styles.inputLabel}>Especialidad *</Text>
                  <TextInput style={styles.textInput}
                    value={editForm.especialidad}
                    onChangeText={v => setEditForm({ ...editForm, especialidad: v })}
                    placeholder="Ej: Electricista"
                    placeholderTextColor={COLORS.textMuted}
                  />
                  <Text style={styles.inputLabel}>Nombre del servicio *</Text>
                  <TextInput style={styles.textInput}
                    value={editForm.nombreServicio}
                    onChangeText={v => setEditForm({ ...editForm, nombreServicio: v })}
                    placeholder="Ej: Instalaciones eléctricas"
                    placeholderTextColor={COLORS.textMuted}
                  />
                  <Text style={styles.inputLabel}>Descripción</Text>
                  <TextInput style={[styles.textInput, { height: 80 }]}
                    value={editForm.descripcionServicio}
                    onChangeText={v => setEditForm({ ...editForm, descripcionServicio: v })}
                    multiline textAlignVertical="top"
                    placeholder="Describe tu servicio..."
                    placeholderTextColor={COLORS.textMuted}
                  />
                  <View style={styles.dosCampos}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Tarifa hora ($)</Text>
                      <TextInput style={styles.textInput}
                        value={editForm.tarifaHora}
                        onChangeText={v => setEditForm({ ...editForm, tarifaHora: v })}
                        keyboardType="numeric" placeholder="0"
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Tarifa base ($)</Text>
                      <TextInput style={styles.textInput}
                        value={editForm.tarifaServicioBase}
                        onChangeText={v => setEditForm({ ...editForm, tarifaServicioBase: v })}
                        keyboardType="numeric" placeholder="0"
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>
                  </View>
                  <View style={styles.formAcciones}>
                    <TouchableOpacity style={styles.btnGuardar} onPress={handleGuardarOficio} disabled={guardandoOficio}>
                      {guardandoOficio
                        ? <ActivityIndicator color={COLORS.surface} />
                        : <Text style={styles.btnGuardarTexto}>Guardar</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnCancelar} onPress={() => setEditandoOficio(false)} disabled={guardandoOficio}>
                      <Text style={styles.btnCancelarTexto}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <Text style={styles.seccionTitulo}>DESCRIPCIÓN DEL SERVICIO</Text>
                  <Text style={styles.descripcionTexto}>
                    {oficioSeleccionado.descripcionServicio
                      ?? `Servicio profesional de ${oficioSeleccionado.especialidad?.toLowerCase()}.`}
                  </Text>
                  {(oficioSeleccionado.tarifaHora || oficioSeleccionado.tarifaServicioBase) && (
                    <View style={styles.tarifasRow}>
                      {oficioSeleccionado.tarifaHora && (
                        <View style={styles.tarifaItem}>
                          <Text style={styles.tarifaValor}>${oficioSeleccionado.tarifaHora.toLocaleString()}/hr</Text>
                          <Text style={styles.tarifaLabel}>Por hora</Text>
                        </View>
                      )}
                      {oficioSeleccionado.tarifaServicioBase && (
                        <View style={styles.tarifaItem}>
                          <Text style={styles.tarifaValor}>Desde ${oficioSeleccionado.tarifaServicioBase.toLocaleString()}</Text>
                          <Text style={styles.tarifaLabel}>Tarifa base</Text>
                        </View>
                      )}
                    </View>
                  )}
                </>
              )}
            </>
          )}

          {/* TAB: SERVICIOS */}
          {tabActivo === 'Servicios' && (
            <>
              <View style={styles.serviciosTitulofila}>
                <Text style={styles.seccionTitulo}>SERVICIOS OFRECIDOS</Text>
                {esMiPerfil && (
                  <TouchableOpacity
                    style={styles.btnAgregar}
                    onPress={() => setMostrarFormNuevo(v => !v)}
                  >
                    <Ionicons name={mostrarFormNuevo ? 'close' : 'add'} size={18} color={COLORS.primary} />
                    <Text style={styles.btnAgregarTexto}>{mostrarFormNuevo ? 'Cancelar' : 'Agregar'}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {cargando ? <ActivityIndicator color={COLORS.primary} /> : oficios.map(o => (
                <View key={o.id} style={styles.servicioItem}>
                  <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.primary} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.servicioNombre}>{o.nombreServicio ?? o.especialidad}</Text>
                    {o.tarifaServicioBase && (
                      <Text style={styles.servicioTarifa}>Desde ${o.tarifaServicioBase.toLocaleString()}</Text>
                    )}
                  </View>
                  {esMiPerfil && (
                    <Switch
                      value={o.activo}
                      onValueChange={() => handleToggleActivo(o)}
                      trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                      thumbColor={o.activo ? COLORS.primary : COLORS.textMuted}
                    />
                  )}
                </View>
              ))}

              {esMiPerfil && mostrarFormNuevo && (
                <View style={styles.formNuevoOficio}>
                  <Text style={styles.formNuevoTitulo}>NUEVO OFICIO</Text>
                  <Text style={styles.inputLabel}>Especialidad *</Text>
                  <TextInput style={styles.textInput}
                    value={nuevoForm.especialidad}
                    onChangeText={v => setNuevoForm({ ...nuevoForm, especialidad: v })}
                    placeholder="Ej: Gasfiter"
                    placeholderTextColor={COLORS.textMuted}
                  />
                  <Text style={styles.inputLabel}>Nombre del servicio *</Text>
                  <TextInput style={styles.textInput}
                    value={nuevoForm.nombreServicio}
                    onChangeText={v => setNuevoForm({ ...nuevoForm, nombreServicio: v })}
                    placeholder="Ej: Reparación de cañerías"
                    placeholderTextColor={COLORS.textMuted}
                  />
                  <Text style={styles.inputLabel}>Descripción</Text>
                  <TextInput style={[styles.textInput, { height: 70 }]}
                    value={nuevoForm.descripcion}
                    onChangeText={v => setNuevoForm({ ...nuevoForm, descripcion: v })}
                    multiline textAlignVertical="top"
                    placeholder="Describe el servicio..."
                    placeholderTextColor={COLORS.textMuted}
                  />
                  <View style={styles.dosCampos}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Tarifa hora ($)</Text>
                      <TextInput style={styles.textInput}
                        value={nuevoForm.tarifaHora}
                        onChangeText={v => setNuevoForm({ ...nuevoForm, tarifaHora: v })}
                        keyboardType="numeric" placeholder="0"
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Tarifa base ($)</Text>
                      <TextInput style={styles.textInput}
                        value={nuevoForm.tarifaBase}
                        onChangeText={v => setNuevoForm({ ...nuevoForm, tarifaBase: v })}
                        keyboardType="numeric" placeholder="0"
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>
                  </View>
                  <TouchableOpacity style={styles.btnGuardar} onPress={handleAgregarOficio} disabled={guardandoNuevo}>
                    {guardandoNuevo
                      ? <ActivityIndicator color={COLORS.surface} />
                      : <Text style={styles.btnGuardarTexto}>Guardar oficio</Text>}
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {/* TAB: RESEÑAS */}
          {tabActivo === 'Reseñas' && (
            <>
              <Text style={styles.seccionTitulo}>RESEÑAS RECIBIDAS</Text>
              {resenas.length === 0 ? (
                <Text style={styles.descripcionTexto}>
                  {oficioSeleccionado.nombreServicio ?? 'Este servicio'} aún no tiene reseñas.
                </Text>
              ) : (
                resenas.map(r => (
                  <View key={r.id} style={styles.resenaCard}>
                    <View style={styles.resenaHeader}>
                      <Text style={styles.resenaNombre}>{r.nombreEvaluador ?? 'Cliente'}</Text>
                      <Text style={styles.resenaEstrellas}>
                        {'★'.repeat(r.puntaje)}{'☆'.repeat(5 - r.puntaje)}
                      </Text>
                    </View>
                    {r.comentario ? (
                      <Text style={styles.resenaTexto}>{r.comentario}</Text>
                    ) : null}
                    <Text style={styles.resenaFecha}>
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString('es-CL', {
                            day: '2-digit', month: 'long', year: 'numeric',
                          })
                        : ''}
                    </Text>
                  </View>
                ))
              )}
            </>
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FOOTER */}
      {!esMiPerfil && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.btnContactar}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CrearSolicitud', {
              oficio: oficioSeleccionado,
              oficios,
            })}
          >
            <Text style={styles.btnContactarTexto}>
              {`Contactar a ${(oficioInicial.nombreTrabajador ?? 'Técnico').split(' ')[0]}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla:  { flex: 1, backgroundColor: COLORS.surface },
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  btnAtras:  { padding: 4 },
  headerTitulo: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },

  perfilBloque: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20 },
  avatar:       { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarTexto:  { color: COLORS.surface, fontSize: 24, fontWeight: '700' },
  nombre:       { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  oficio:       { fontSize: 14, color: COLORS.textSecondary, marginBottom: 16 },
  statsRow:     { flexDirection: 'row', alignItems: 'center', gap: 16 },
  statItem:     { alignItems: 'center' },
  statValor:    { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  statLabel:    { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  separador:    { width: 1, height: 30, backgroundColor: COLORS.border },

  selectorContainer: { marginHorizontal: 16, marginBottom: 4 },
  selectorBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, backgroundColor: COLORS.background },
  selectorTexto:     { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  selectorBadgeRow:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badgeInactivo:     { backgroundColor: COLORS.errorBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeInactivoTexto:{ fontSize: 11, color: COLORS.error, fontWeight: '600' },
  dropdownLista:     { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, marginTop: 4, backgroundColor: COLORS.surface, overflow: 'hidden' },
  dropdownItem:      { paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  dropdownItemActivo:{ backgroundColor: COLORS.primaryLight },
  dropdownItemTexto: { fontSize: 14, color: COLORS.textPrimary },
  dropdownItemTextoActivo: { color: COLORS.primary, fontWeight: '700' },
  dropdownInactivoLabel:   { fontSize: 11, color: COLORS.textMuted },

  tabsRow:     { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border, marginTop: 8 },
  tab:         { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActivo:   { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabTexto:    { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  tabTextoActivo: { color: COLORS.primary },
  tabContenido:   { padding: 20 },

  seccionTitulo:    { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.8, marginBottom: 12 },
  descripcionTexto: { fontSize: 14, color: COLORS.textLight, lineHeight: 22 },
  tarifasRow:       { flexDirection: 'row', gap: 16, marginTop: 16 },
  tarifaItem:       { backgroundColor: COLORS.background, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: COLORS.borderLight },
  tarifaValor:      { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  tarifaLabel:      { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },

  btnEditar:       { alignSelf: 'flex-end', backgroundColor: COLORS.primaryLight, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, marginBottom: 14 },
  btnEditarTexto:  { color: COLORS.primary, fontSize: 13, fontWeight: '700' },

  formContainer: { gap: 10 },
  inputLabel:    { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, marginTop: 8 },
  textInput:     { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: COLORS.textPrimary, backgroundColor: COLORS.background },
  dosCampos:     { flexDirection: 'row', gap: 10 },
  formAcciones:  { flexDirection: 'row', gap: 8, marginTop: 8 },
  btnGuardar:    { flex: 1, backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnGuardarTexto:   { color: COLORS.surface, fontSize: 14, fontWeight: '700' },
  btnCancelar:       { flex: 1, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
  btnCancelarTexto:  { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },

  serviciosTitulofila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  servicioItem:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  servicioNombre:{ fontSize: 14, color: COLORS.textPrimary, fontWeight: '600' },
  servicioTarifa:{ fontSize: 12, color: COLORS.primary, marginTop: 2 },
  btnAgregar:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  btnAgregarTexto: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },

  formNuevoOficio: { marginTop: 16, padding: 14, backgroundColor: COLORS.background, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderLight, gap: 4 },
  formNuevoTitulo: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.8, marginBottom: 8 },

  resenaCard:    { backgroundColor: COLORS.background, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.borderLight },
  resenaHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  resenaNombre:  { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  resenaEstrellas: { fontSize: 14, color: COLORS.warning },
  resenaTexto:   { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 4 },
  resenaFecha:   { fontSize: 11, color: COLORS.textMuted },

  footer:        { paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.surface },
  btnContactar:  { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnContactarTexto: { color: COLORS.surface, fontSize: 16, fontWeight: '700' },
});
