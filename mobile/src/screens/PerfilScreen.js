import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { logout } from '../services/authService';
import { obtenerPerfilPorId, actualizarPerfil, obtenerOficiosPorTrabajador } from '../services/userService';
import { COLORS } from '../theme';

export default function PerfilScreen({ navigation }) {
  const { user, clearUser } = useUser();

  const [perfilData, setPerfilData] = useState(null);
  const [cargando, setCargando]     = useState(true);
  const [editando, setEditando]     = useState(false);
  const [guardando, setGuardando]   = useState(false);
  const [navegando, setNavegando]   = useState(false);
  const [editForm, setEditForm]     = useState({ nombre: '', apellido: '', telefono: '', ciudad: '' });

  useEffect(() => {
    if (!user.perfilId) return;
    obtenerPerfilPorId(user.perfilId)
      .then(setPerfilData)
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [user.perfilId]);

  const handleLogout = async () => {
    await logout();
    clearUser();
    navigation.replace('Login');
  };

  const handleEditar = () => {
    const partes = perfilData?.nombreCompleto?.split(' ') || [];
    setEditForm({
      nombre:   partes[0] || '',
      apellido: partes.slice(1).join(' ') || '',
      telefono: perfilData?.telefono || '',
      ciudad:   perfilData?.ciudad || '',
    });
    setEditando(true);
  };

  const handleGuardar = async () => {
    if (!editForm.nombre.trim() || !editForm.apellido.trim()) {
      Alert.alert('Campos incompletos', 'Nombre y apellido son obligatorios.');
      return;
    }
    setGuardando(true);
    try {
      const updated = await actualizarPerfil(user.perfilId, {
        usuarioId:       user.userId,
        nombreCompleto:  `${editForm.nombre.trim()} ${editForm.apellido.trim()}`,
        telefono:        editForm.telefono.trim(),
        ciudad:          editForm.ciudad.trim(),
        region:          perfilData?.region || 'Metropolitana',
        descripcion:     perfilData?.descripcion || '',
        fotoPerfil:      perfilData?.fotoPerfil || null,
        fechaNacimiento: perfilData?.fechaNacimiento || null,
      });
      setPerfilData(updated);
      setEditando(false);
    } catch {
      Alert.alert('Error', 'No se pudo guardar el perfil.');
    } finally {
      setGuardando(false);
    }
  };

  const handleVerPerfilProfesional = async () => {
    setNavegando(true);
    try {
      const oficios = await obtenerOficiosPorTrabajador(user.trabajadorId);
      if (!oficios || oficios.length === 0) {
        Alert.alert('Sin oficios', 'No tienes oficios registrados. Activa tu perfil primero.');
        return;
      }
      navigation.navigate('PerfilTecnico', { oficio: oficios[0] });
    } catch {
      Alert.alert('Error', 'No se pudo cargar tu perfil profesional.');
    } finally {
      setNavegando(false);
    }
  };

  const iniciales = user.nombreCompleto
    ? user.nombreCompleto.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?';

  const miembroDesde = perfilData?.fechaCreacion
    ? new Date(perfilData.fechaCreacion).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>

        {/* AVATAR Y NOMBRE */}
        <View style={styles.avatarBloque}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{iniciales}</Text>
          </View>
          <Text style={styles.nombre}>{user.nombreCompleto ?? ''}</Text>
          {user.esTrabajador && (
            <View style={styles.badgeTrabajador}>
              <Ionicons name="briefcase" size={12} color={COLORS.primary} />
              <Text style={styles.badgeTexto}>Perfil de trabajador activo</Text>
            </View>
          )}
        </View>

        {/* MIS DATOS */}
        <View style={styles.tarjeta}>
          <View style={styles.tarjetaHeader}>
            <View style={styles.tarjetaHeaderFila}>
              <Ionicons name="person-outline" size={18} color={COLORS.primary} />
              <Text style={styles.tarjetaTitulo}>Mis Datos</Text>
            </View>
            {!editando && (
              <TouchableOpacity onPress={handleEditar} style={styles.btnEditar}>
                <Text style={styles.btnEditarTexto}>Editar</Text>
              </TouchableOpacity>
            )}
          </View>

          {editando ? (
            <View style={styles.formContainer}>
              <View style={styles.formGrupo}>
                <Text style={styles.inputLabel}>Nombre</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.nombre}
                  onChangeText={v => setEditForm({ ...editForm, nombre: v })}
                  placeholder="Nombre"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
              <View style={styles.formGrupo}>
                <Text style={styles.inputLabel}>Apellido</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.apellido}
                  onChangeText={v => setEditForm({ ...editForm, apellido: v })}
                  placeholder="Apellido"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
              <View style={styles.formGrupo}>
                <Text style={styles.inputLabel}>Teléfono</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.telefono}
                  onChangeText={v => setEditForm({ ...editForm, telefono: v })}
                  keyboardType="phone-pad"
                  placeholder="+56 9 1234 5678"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
              <View style={styles.formGrupo}>
                <Text style={styles.inputLabel}>Ciudad / Comuna</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.ciudad}
                  onChangeText={v => setEditForm({ ...editForm, ciudad: v })}
                  placeholder="Santiago"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
              <View style={styles.formAcciones}>
                <TouchableOpacity onPress={handleGuardar} style={styles.btnGuardar} disabled={guardando}>
                  {guardando
                    ? <ActivityIndicator color={COLORS.surface} />
                    : <Text style={styles.btnGuardarTexto}>Guardar</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditando(false)} style={styles.btnCancelar} disabled={guardando}>
                  <Text style={styles.btnCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.datosGrid}>
              <View style={styles.datoItem}>
                <Text style={styles.datoLabel}>Región</Text>
                <Text style={styles.datoValor}>{perfilData?.region || 'No registrada'}</Text>
              </View>
              <View style={styles.datoItem}>
                <Text style={styles.datoLabel}>Teléfono</Text>
                <Text style={styles.datoValor}>{perfilData?.telefono || 'No registrado'}</Text>
              </View>
              <View style={styles.datoItem}>
                <Text style={styles.datoLabel}>Ciudad</Text>
                <Text style={styles.datoValor}>{perfilData?.ciudad || 'No registrada'}</Text>
              </View>
              {miembroDesde && (
                <View style={styles.datoItem}>
                  <Text style={styles.datoLabel}>Miembro desde</Text>
                  <Text style={styles.datoValor}>{miembroDesde}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* SECCIÓN TRABAJADOR */}
        {!user.esTrabajador ? (
          <TouchableOpacity
            style={styles.btnActivar}
            onPress={() => navigation.navigate('ActivarTrabajador')}
          >
            <Ionicons name="briefcase-outline" size={20} color={COLORS.primary} />
            <Text style={styles.btnActivarTexto}>Activarme como trabajador</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.btnActivar}
            onPress={handleVerPerfilProfesional}
            disabled={navegando}
          >
            <Ionicons name="briefcase-outline" size={20} color={COLORS.primary} />
            <Text style={styles.btnActivarTexto}>
              {navegando ? 'Cargando...' : 'Ver mi perfil profesional'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        {/* CERRAR SESIÓN */}
        <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.btnLogoutTexto}>Cerrar sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla:  { flex: 1, backgroundColor: COLORS.background },
  centrado:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  contenido: { padding: 24, paddingBottom: 40 },

  avatarBloque: { alignItems: 'center', marginBottom: 28 },
  avatar:       { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarTexto:  { color: COLORS.surface, fontSize: 28, fontWeight: '800' },
  nombre:       { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  badgeTrabajador: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeTexto:   { fontSize: 12, color: COLORS.primary, fontWeight: '600' },

  tarjeta: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 18, marginBottom: 16 },
  tarjetaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 12, marginBottom: 14 },
  tarjetaHeaderFila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tarjetaTitulo: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  btnEditar:     { backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  btnEditarTexto: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },

  datosGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14 },
  datoItem:  { width: '50%', paddingRight: 8 },
  datoLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  datoValor: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },

  formContainer: { gap: 12 },
  formGrupo:     { gap: 4 },
  inputLabel:    { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },
  textInput:     { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: COLORS.textPrimary, backgroundColor: COLORS.background },
  formAcciones:  { flexDirection: 'row', gap: 8, marginTop: 4 },
  btnGuardar:    { flex: 1, backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnGuardarTexto: { color: COLORS.surface, fontSize: 14, fontWeight: '700' },
  btnCancelar:   { flex: 1, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
  btnCancelarTexto: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },

  btnActivar:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.primaryBorder, marginBottom: 16 },
  btnActivarTexto: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.primary },
  seccionTrabajador: { padding: 16, backgroundColor: COLORS.surface, borderRadius: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  seccionTitulo:   { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.8, marginBottom: 6 },
  seccionInfo:     { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600' },

  btnLogout:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: COLORS.errorBg, borderRadius: 14, borderWidth: 1, borderColor: COLORS.errorBorder, marginTop: 4 },
  btnLogoutTexto: { fontSize: 15, fontWeight: '600', color: COLORS.error },
});
