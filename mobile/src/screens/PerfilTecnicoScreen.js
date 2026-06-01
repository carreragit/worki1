import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ESPECIALIDADES_MOCK = {
  Electricista: ['Instalaciones', 'Tableros', 'Emergencias', 'Domótica', 'Reparaciones'],
  Gasfiter:     ['Cañerías', 'Calefont', 'Llaves', 'Emergencias'],
  Pintor:       ['Interior', 'Exterior', 'Decorativa'],
  Cerrajero:    ['Apertura', 'Cambio de chapa', 'Duplicado'],
  Cuidador:     ['Adulto mayor', 'Niños', 'Mascotas'],
};

const RESENAS_MOCK = [
  { nombre: 'Ana González', estrellas: 5, texto: 'Excelente trabajo. Llegó puntual y dejó el lugar limpio.' },
  { nombre: 'Carlos M.',    estrellas: 4, texto: 'Resolvió el problema rápido y el precio fue justo.' },
];

const TABS = ['Información', 'Reseñas', 'Servicios'];

export default function PerfilTecnicoScreen({ route, navigation }) {
  const { worker } = route.params;
  const [tabActivo, setTabActivo] = useState('Información');

  const especialidades = ESPECIALIDADES_MOCK[worker.oficio] || [worker.oficio];

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnAtras}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Perfil del técnico</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── PERFIL SUPERIOR ── */}
        <View style={styles.perfilBloque}>
          <View style={[styles.avatar, { backgroundColor: worker.color }]}>
            <Text style={styles.avatarTexto}>{worker.iniciales}</Text>
          </View>

          <View style={styles.badgeVerificado}>
            <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
            <Text style={styles.badgeTexto}>Identidad verificada</Text>
          </View>

          <Text style={styles.nombre}>{worker.nombre}</Text>
          <Text style={styles.oficio}>{worker.oficio} certificado</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValor}>★ {worker.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.separador} />
            <View style={styles.statItem}>
              <Text style={styles.statValor}>67</Text>
              <Text style={styles.statLabel}>Reseñas</Text>
            </View>
            <View style={styles.separador} />
            <View style={styles.statItem}>
              <Text style={styles.statValor}>3 años</Text>
              <Text style={styles.statLabel}>Experiencia</Text>
            </View>
          </View>

          <View style={styles.ubicacionRow}>
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text style={styles.ubicacionTexto}>Santiago · radio 5 km</Text>
          </View>
        </View>

        {/* ── TABS ── */}
        <View style={styles.tabsRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setTabActivo(tab)}
              style={[styles.tab, tabActivo === tab && styles.tabActivo]}
            >
              <Text style={[styles.tabTexto, tabActivo === tab && styles.tabTextoActivo]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── CONTENIDO TAB ── */}
        <View style={styles.tabContenido}>

          {tabActivo === 'Información' && (
            <>
              <Text style={styles.seccionTitulo}>SOBRE {worker.nombre.split(' ')[0].toUpperCase()}</Text>
              <Text style={styles.descripcionTexto}>
                Profesional con amplia experiencia en {worker.oficio.toLowerCase()}.
                Trabajo con materiales certificados y entrego garantía en todas mis instalaciones.
              </Text>

              <Text style={[styles.seccionTitulo, { marginTop: 20 }]}>ESPECIALIDADES</Text>
              <View style={styles.chipsRow}>
                {especialidades.map(e => (
                  <View key={e} style={styles.chip}>
                    <Text style={styles.chipTexto}>{e}</Text>
                  </View>
                ))}
              </View>

              <Text style={[styles.seccionTitulo, { marginTop: 20 }]}>ÚLTIMAS RESEÑAS</Text>
              {RESENAS_MOCK.map((r, i) => (
                <View key={i} style={styles.resenaCard}>
                  <View style={styles.resenaHeader}>
                    <Text style={styles.resenaNombre}>{r.nombre}</Text>
                    <Text style={styles.resenaEstrellas}>{'★'.repeat(r.estrellas)}</Text>
                  </View>
                  <Text style={styles.resenaTexto}>{r.texto}</Text>
                </View>
              ))}
            </>
          )}

          {tabActivo === 'Reseñas' && (
            <>
              <Text style={styles.seccionTitulo}>TODAS LAS RESEÑAS</Text>
              {RESENAS_MOCK.map((r, i) => (
                <View key={i} style={styles.resenaCard}>
                  <View style={styles.resenaHeader}>
                    <Text style={styles.resenaNombre}>{r.nombre}</Text>
                    <Text style={styles.resenaEstrellas}>{'★'.repeat(r.estrellas)}</Text>
                  </View>
                  <Text style={styles.resenaTexto}>{r.texto}</Text>
                </View>
              ))}
            </>
          )}

          {tabActivo === 'Servicios' && (
            <>
              <Text style={styles.seccionTitulo}>SERVICIOS OFRECIDOS</Text>
              {especialidades.map((e, i) => (
                <View key={i} style={styles.servicioItem}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#16A34A" />
                  <Text style={styles.servicioTexto}>{e}</Text>
                </View>
              ))}
              <Text style={styles.precioInfo}>
                Desde <Text style={{ fontWeight: '700', color: '#16A34A' }}>${worker.precio}</Text> por servicio
              </Text>
            </>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── BOTÓN FIJO INFERIOR ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.btnContactar}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('CrearSolicitud', { worker })}
        >
          <Text style={styles.btnContactarTexto}>
            Contactar a {worker.nombre.split(' ')[0]}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnCorazon}>
          <Ionicons name="heart-outline" size={24} color="#16A34A" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  btnAtras: { padding: 4 },
  headerTitulo: { fontSize: 17, fontWeight: '700', color: '#111827' },

  perfilBloque: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  avatarTexto: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },

  badgeVerificado: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, marginBottom: 10,
  },
  badgeTexto: { fontSize: 11, color: '#16A34A', fontWeight: '600' },

  nombre: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  oficio: { fontSize: 14, color: '#6B7280', marginBottom: 16 },

  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
  statItem: { alignItems: 'center' },
  statValor: { fontSize: 15, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  separador: { width: 1, height: 30, backgroundColor: '#E5E7EB' },

  ubicacionRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ubicacionTexto: { fontSize: 13, color: '#6B7280' },

  tabsRow: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActivo: { borderBottomWidth: 2, borderBottomColor: '#16A34A' },
  tabTexto: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
  tabTextoActivo: { color: '#16A34A' },

  tabContenido: { padding: 20 },
  seccionTitulo: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.8, marginBottom: 8 },

  descripcionTexto: { fontSize: 14, color: '#374151', lineHeight: 22 },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 12, borderWidth: 1, borderColor: '#BBF7D0',
  },
  chipTexto: { fontSize: 12, color: '#16A34A', fontWeight: '600' },

  resenaCard: {
    backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, marginBottom: 10,
  },
  resenaHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  resenaNombre: { fontSize: 14, fontWeight: '700', color: '#111827' },
  resenaEstrellas: { color: '#FBBF24', fontSize: 14 },
  resenaTexto: { fontSize: 13, color: '#6B7280', lineHeight: 20 },

  servicioItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  servicioTexto: { fontSize: 14, color: '#374151' },
  precioInfo: { marginTop: 16, fontSize: 14, color: '#6B7280' },

  footer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: '#FFFFFF',
  },
  btnContactar: {
    flex: 1, backgroundColor: '#16A34A', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  btnContactarTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  btnCorazon: {
    width: 48, height: 48, borderRadius: 14,
    borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
});
