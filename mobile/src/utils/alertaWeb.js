/**
 * alertaWeb.js
 *
 * En web, react-native-web NO implementa Alert.alert con botones: las llamadas
 * no hacen nada. Antes esto dejaba sin funcionar los botones que abren una
 * confirmación o un aviso (aceptar/rechazar/cancelar solicitud, enviar
 * solicitud, enviar reseña, activar perfil).
 *
 * Aquí redirigimos Alert.alert (solo en web) a un Modal propio con los estilos
 * de la app, en vez del feo window.alert del navegador. Así:
 *   - No hay que tocar ninguna de las llamadas a Alert.alert existentes.
 *   - En móvil no se cambia nada: se usa el Alert nativo de siempre.
 *
 * Para que funcione basta con montar <DialogoHost /> una vez (en App.js).
 */
import { useEffect, useState } from 'react';
import {
  Alert, Platform, Modal, View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { COLORS } from '../theme';

// Puente entre Alert.alert y el <DialogoHost/>: el host registra aquí su
// función para abrir el diálogo. Mientras no esté montado, queda en null.
let abrirDialogo = null;

if (Platform.OS === 'web') {
  Alert.alert = (titulo, mensaje, botones) => {
    // Si el host todavía no se montó, no rompemos: simplemente ignoramos.
    if (!abrirDialogo) return;
    // Si no vienen botones, usamos un "OK" por defecto (caso aviso simple).
    abrirDialogo({
      titulo,
      mensaje,
      botones: botones && botones.length ? botones : [{ text: 'OK' }],
    });
  };
}

/**
 * DialogoHost — se monta una sola vez en App.js. Escucha las llamadas a
 * Alert.alert y dibuja el Modal temático. En móvil no renderiza nada.
 */
export function DialogoHost() {
  const [dialogo, setDialogo] = useState(null);

  // Registra esta pantalla como destino de Alert.alert mientras esté montada.
  useEffect(() => {
    abrirDialogo = setDialogo;
    return () => { abrirDialogo = null; };
  }, []);

  if (Platform.OS !== 'web' || !dialogo) return null;

  const { titulo, mensaje, botones } = dialogo;

  // Cierra el diálogo y ejecuta el onPress del botón pulsado (si tiene).
  const pulsar = (boton) => {
    setDialogo(null);
    boton?.onPress?.();
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={() => setDialogo(null)}>
      {/* Fondo oscuro semitransparente que centra la caja */}
      <View style={styles.fondo}>
        <View style={styles.caja}>
          {!!titulo  && <Text style={styles.titulo}>{titulo}</Text>}
          {!!mensaje && <Text style={styles.mensaje}>{mensaje}</Text>}

          {/* Un botón por cada entrada del array de Alert.alert.
              El de style 'cancel' se ve secundario; el resto, primario. */}
          <View style={styles.botonera}>
            {botones.map((boton, i) => {
              const esCancelar = boton.style === 'cancel';
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.boton, esCancelar ? styles.botonCancelar : styles.botonPrimario]}
                  onPress={() => pulsar(boton)}
                >
                  <Text style={esCancelar ? styles.textoCancelar : styles.textoPrimario}>
                    {boton.text ?? 'OK'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  caja: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 22,
  },
  titulo:  { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
  mensaje: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 20 },
  botonera: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  boton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12, minWidth: 80, alignItems: 'center' },
  botonPrimario:  { backgroundColor: COLORS.primary },
  botonCancelar:  { backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border },
  textoPrimario:  { color: COLORS.surface, fontSize: 15, fontWeight: '700' },
  textoCancelar:  { color: COLORS.textSecondary, fontSize: 15, fontWeight: '700' },
});
