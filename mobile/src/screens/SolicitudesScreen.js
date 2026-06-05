import { View, Text, StyleSheet } from 'react-native';

export default function SolicitudesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Solicitudes</Text>
      <Text style={styles.subtexto}>En desarrollo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' },
  texto:     { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtexto:  { fontSize: 14, color: '#6B7280', marginTop: 6 },
});
