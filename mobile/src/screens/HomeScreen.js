import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// ─── 1. DATOS MOCK ────────────────────────────────────────────────────────────
// Lista fija de trabajadores. Más adelante se reemplaza con datos del backend.

const CATEGORIAS = ['Todos', 'Electricista', 'Gasfiter', 'Pintor', 'Cerrajero', 'Cuidador'];

const TRABAJADORES = [
  { id: 1, iniciales: 'AP', nombre: 'Ana Pizarro',    oficio: 'Electricista', rating: 4.7, precio: '30.000', color: '#16A34A' },
  { id: 2, iniciales: 'CR', nombre: 'Carlos Rojas',   oficio: 'Gasfiter',     rating: 4.5, precio: '25.000', color: '#2563EB' },
  { id: 3, iniciales: 'MG', nombre: 'María González', oficio: 'Cerrajero',    rating: 4.8, precio: '20.000', color: '#9333EA' },
  { id: 4, iniciales: 'PM', nombre: 'Pedro Muñoz',    oficio: 'Pintor',       rating: 4.3, precio: '35.000', color: '#EA580C' },
  { id: 5, iniciales: 'ST', nombre: 'Sofía Torres',   oficio: 'Cuidador',     rating: 4.9, precio: '15.000', color: '#0891B2' },
];

// ─── 2. COMPONENTE: CHIP DE CATEGORÍA ────────────────────────────────────────
// Un botón pequeño tipo pastilla para filtrar por oficio.
// active=true → fondo verde. active=false → fondo gris claro.

function CategoryChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.chip, active ? styles.chipActivo : styles.chipInactivo]}
    >
      <Text style={[styles.chipTexto, active ? styles.chipTextoActivo : styles.chipTextoInactivo]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── 3. COMPONENTE: TARJETA DE TRABAJADOR ────────────────────────────────────
// Muestra los datos de un trabajador en una tarjeta con sombra.

function WorkerCard({ worker }) {
  return (
    <View style={styles.card}>

      {/* Avatar circular con las iniciales del nombre */}
      <View style={[styles.avatar, { backgroundColor: worker.color }]}>
        <Text style={styles.avatarTexto}>{worker.iniciales}</Text>
      </View>

      {/* Nombre, oficio y rating */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardNombre}>{worker.nombre}</Text>
        <Text style={styles.cardOficio}>{worker.oficio}</Text>
        <View style={styles.ratingFila}>
          <Text style={styles.estrella}>★</Text>
          <Text style={styles.ratingTexto}>{worker.rating}</Text>
        </View>
      </View>

      {/* Precio mínimo alineado a la derecha */}
      <View style={styles.precioBloque}>
        <Text style={styles.precioDesde}>Desde</Text>
        <Text style={styles.precio}>${worker.precio}</Text>
      </View>

    </View>
  );
}

// ─── 4. PANTALLA PRINCIPAL ───────────────────────────────────────────────────

export default function HomeScreen() {
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  // Filtra la lista según categoría seleccionada y texto del buscador
  const trabajadoresFiltrados = TRABAJADORES.filter(t => {
    const matchCategoria = categoriaActiva === 'Todos' || t.oficio === categoriaActiva;
    const matchBusqueda  = t.nombre.toLowerCase().includes(busqueda.toLowerCase())
                        || t.oficio.toLowerCase().includes(busqueda.toLowerCase());
    return matchCategoria && matchBusqueda;
  });

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar barStyle="light-content" backgroundColor="#15803D" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── HEADER CON GRADIENTE ── */}
        <LinearGradient
          colors={['#15803D', '#16A34A', '#4ADE80']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerSaludo}>Bienvenido 👋</Text>
          <Text style={styles.headerTitulo}>¿Qué servicio{'\n'}necesitas hoy?</Text>

          {/* Buscador */}
          <View style={styles.buscador}>
            <Text style={styles.buscadorIcono}>🔍</Text>
            <TextInput
              style={styles.buscadorInput}
              placeholder="Buscar electricista, gasfiter..."
              placeholderTextColor="#9CA3AF"
              value={busqueda}
              onChangeText={setBusqueda}
            />
          </View>
        </LinearGradient>

        {/* ── CATEGORÍAS ── */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Categorías</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIAS.map(cat => (
              <CategoryChip
                key={cat}
                label={cat}
                active={cat === categoriaActiva}
                onPress={() => setCategoriaActiva(cat)}
              />
            ))}
          </ScrollView>
        </View>

        {/* ── LISTA DE TRABAJADORES ── */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Trabajadores</Text>

          {trabajadoresFiltrados.length === 0
            ? <Text style={styles.sinResultados}>Sin resultados para "{busqueda}"</Text>
            : trabajadoresFiltrados.map(w => <WorkerCard key={w.id} worker={w} />)
          }
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── 5. ESTILOS ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  pantalla: { flex: 1, backgroundColor: '#F9FAFB' },

  // Header
  header: {
    paddingTop: 24,
    paddingBottom: 36,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerSaludo: { color: '#DCFCE7', fontSize: 14, fontWeight: '500' },
  headerTitulo: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginTop: 6, lineHeight: 34 },

  // Buscador
  buscador: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  buscadorIcono: { fontSize: 16, marginRight: 8 },
  buscadorInput: { flex: 1, fontSize: 14, color: '#111827' },

  // Secciones
  seccion: { paddingHorizontal: 20, paddingTop: 24 },
  seccionTitulo: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 12 },

  // Chips
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginRight: 8 },
  chipActivo:   { backgroundColor: '#16A34A' },
  chipInactivo: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  chipTexto:    { fontSize: 13, fontWeight: '600' },
  chipTextoActivo:   { color: '#FFFFFF' },
  chipTextoInactivo: { color: '#6B7280' },

  // Cards
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  cardInfo:    { flex: 1 },
  cardNombre:  { fontSize: 15, fontWeight: '700', color: '#111827' },
  cardOficio:  { fontSize: 13, color: '#6B7280', marginTop: 2 },
  ratingFila:  { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 3 },
  estrella:    { color: '#FBBF24', fontSize: 13 },
  ratingTexto: { fontSize: 12, fontWeight: '600', color: '#111827' },
  precioBloque:{ alignItems: 'flex-end' },
  precioDesde: { fontSize: 10, color: '#6B7280' },
  precio:      { fontSize: 15, fontWeight: '700', color: '#16A34A' },

  // Sin resultados
  sinResultados: { color: '#9CA3AF', textAlign: 'center', marginTop: 24, fontSize: 14 },
});
