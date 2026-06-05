/**
 * PerfilScreen
 *
 * Muestra el perfil del usuario autenticado. Su comportamiento cambia según el rol:
 *
 * - Si el usuario NO es trabajador: muestra un botón para ir a ActivarTrabajadorScreen.
 * - Si el usuario YA es trabajador: muestra un badge de "Perfil de trabajador activo"
 *   y el ID de trabajador en lugar del botón de activación.
 *
 * También contiene el botón de cerrar sesión, que borra el token local y
 * limpia el contexto de usuario antes de redirigir al Login.
 */
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { logout } from '../services/authService';
import { COLORS } from '../theme';

export default function PerfilScreen({ navigation }) {
  const { user, clearUser } = useUser();

  const handleLogout = async () => {
    // logout() elimina el token del almacenamiento local; clearUser() limpia el contexto global
    await logout();
    clearUser();
    // replace en lugar de navigate para que el usuario no pueda volver atrás con el botón físico
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>

        {/* AVATAR Y NOMBRE */}
        <View style={styles.avatarBloque}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>
              {user.nombreCompleto ? user.nombreCompleto[0].toUpperCase() : '?'}
            </Text>
          </View>
          <Text style={styles.nombre}>{user.nombreCompleto ?? 'Cargando...'}</Text>
          {user.esTrabajador && (
            <View style={styles.badgeTrabajador}>
              <Ionicons name="briefcase" size={12} color={COLORS.primary} />
              <Text style={styles.badgeTexto}>Perfil de trabajador activo</Text>
            </View>
          )}
        </View>

        {/* SECCIÓN TRABAJADOR */}
        {!user.esTrabajador ? (
          <TouchableOpacity style={styles.btnActivar}
            onPress={() => navigation.navigate('ActivarTrabajador')}>
            <Ionicons name="briefcase-outline" size={20} color={COLORS.primary} />
            <Text style={styles.btnActivarTexto}>Activarme como trabajador</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.seccionTrabajador}>
            <Text style={styles.seccionTitulo}>PERFIL PROFESIONAL</Text>
            <Text style={styles.seccionInfo}>ID Trabajador: #{user.trabajadorId}</Text>
          </View>
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
  pantalla: { flex: 1, backgroundColor: COLORS.background },
  contenido: { padding: 24 },
  avatarBloque: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarTexto: { color: COLORS.surface, fontSize: 28, fontWeight: '800' },
  nombre: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  badgeTrabajador: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeTexto: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  btnActivar: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.primaryBorder, marginBottom: 16 },
  btnActivarTexto: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.primary },
  seccionTrabajador: { padding: 16, backgroundColor: COLORS.surface, borderRadius: 14, marginBottom: 16 },
  seccionTitulo: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.8, marginBottom: 8 },
  seccionInfo: { fontSize: 14, color: COLORS.textLight },
  btnLogout: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: COLORS.errorBg, borderRadius: 14, borderWidth: 1, borderColor: COLORS.errorBorder },
  btnLogoutTexto: { fontSize: 15, fontWeight: '600', color: COLORS.error },
});
