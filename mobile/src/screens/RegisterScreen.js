import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,        // Modal nativo de React Native — aparece encima de toda la pantalla
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { registro } from '../services/authService';
import { COLORS, GRADIENTS, RADII, SHADOWS } from '../theme';

// Texto de los Términos y Condiciones — editalo aquí cuando necesites actualizarlos
const TERMINOS_TEXTO = `TÉRMINOS Y CONDICIONES DE USO — WORKI

Última actualización: junio 2026

1. DESCRIPCIÓN DEL SERVICIO
Worki es una plataforma digital que conecta a clientes que necesitan servicios con trabajadores independientes que los ofrecen. Worki actúa únicamente como intermediario tecnológico y no es parte de los contratos de servicios celebrados entre usuarios.

2. ACEPTACIÓN DE TÉRMINOS
Al crear una cuenta en Worki, aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna de estas condiciones, no debes utilizar la plataforma.

3. USO PERMITIDO
Al usar Worki te comprometes a:
- Proporcionar información veraz, completa y actualizada al registrarte.
- No hacerte pasar por otra persona o entidad.
- No usar la plataforma para actividades ilegales, fraudulentas o que dañen a terceros.
- No publicar contenido ofensivo, engañoso, discriminatorio o inapropiado.
- No intentar vulnerar la seguridad o integridad de la plataforma.

4. RESPONSABILIDAD DE LOS USUARIOS
Los usuarios son los únicos responsables de los acuerdos, pagos y prestaciones que realicen entre sí. Worki no garantiza la calidad, puntualidad, idoneidad ni resultado de los servicios contratados a través de la plataforma. El uso de la plataforma es bajo responsabilidad del propio usuario.

5. DERECHOS DE LOS TRABAJADORES EN PLATAFORMA — LEY N° 21.431

La Ley N° 21.431 (vigente desde el 1 de septiembre de 2022) regula las condiciones laborales de los trabajadores que prestan servicios a través de plataformas digitales en Chile. Worki cumple con las obligaciones que esta ley establece:

5.1 Contrato escrito
Los trabajadores que operen a través de Worki tienen derecho a recibir un contrato escrito que detalle las condiciones de prestación de servicios, tarifas, y forma de pago.

5.2 No discriminación algorítmica
Worki se compromete a no utilizar algoritmos, sistemas de puntuación ni mecanismos de asignación de trabajo de manera discriminatoria. Los criterios de visibilidad y asignación de solicitudes serán objetivos, transparentes y no discriminarán por razones de sexo, edad, origen, religión u otras categorías protegidas por la ley.

5.3 Seguros y protección
Conforme a la ley, Worki gestiona o informa a los trabajadores sobre los seguros mínimos exigidos para cubrir daños a terceros derivados de la prestación de servicios a través de la plataforma.

5.4 Capacitación y seguridad
Worki pone a disposición de los trabajadores información y recursos orientados a la seguridad en el desempeño de sus servicios.

5.5 Desconexión y autonomía
Los trabajadores de plataforma mantienen autonomía para aceptar o rechazar solicitudes sin consecuencias punitivas que vulneren sus derechos laborales reconocidos por la Ley N° 21.431.

6. PROTECCIÓN DE DATOS PERSONALES

6.1 Marco legal aplicable
Worki cumple con la Ley N° 19.628 sobre Protección de la Vida Privada (vigente) y se encuentra en proceso de adecuación a la Ley N° 21.719 de Protección de Datos Personales, que entrará en vigencia el 1 de diciembre de 2026. Adicionalmente, adoptamos buenas prácticas alineadas con estándares internacionales como el Reglamento General de Protección de Datos de la Unión Europea (RGPD/GDPR).

6.2 Datos que recopilamos
Para prestarte el servicio recopilamos y tratamos los siguientes datos personales:
- Nombre completo
- Dirección de correo electrónico
- Información de perfil (oficio, descripción, fotografía)
- Datos de ubicación o dirección (solo cuando el usuario los proporciona voluntariamente)
- Historial de solicitudes y valoraciones dentro de la plataforma

6.3 Finalidad del tratamiento
Tus datos son utilizados exclusivamente para:
- Crear y gestionar tu cuenta de usuario.
- Facilitar la conexión entre clientes y trabajadores.
- Enviarte notificaciones relacionadas con el servicio.
- Mejorar la plataforma mediante análisis agregados y anónimos.
- Cumplir con obligaciones legales cuando corresponda.

6.4 Base legal del tratamiento
El tratamiento de tus datos personales se basa en tu consentimiento otorgado al aceptar estos Términos, así como en la ejecución del contrato de uso de la plataforma (Art. 4 Ley 19.628).

6.5 Seguridad de los datos
Implementamos medidas técnicas y organizativas apropiadas para proteger tus datos personales contra accesos no autorizados, pérdida, alteración o divulgación. Esto incluye cifrado de contraseñas, comunicaciones sobre HTTPS y almacenamiento seguro de credenciales. En caso de una brecha de seguridad que pueda afectar tus datos, te notificaremos en el menor tiempo posible, conforme a lo exigido por la ley.

6.6 Conservación de datos
Conservamos tus datos mientras tu cuenta esté activa. Al eliminar tu cuenta, procederemos a suprimir o anonimizar tus datos personales, salvo que la ley exija su conservación por un período determinado.

6.7 No venta de datos
Worki no vende, arrienda ni cede tus datos personales a terceros con fines comerciales. Solo compartimos datos con proveedores de servicios técnicos estrictamente necesarios para el funcionamiento de la plataforma, bajo acuerdos de confidencialidad.

7. DERECHOS DEL TITULAR DE DATOS (DERECHOS ARCO)
De conformidad con la Ley N° 19.628 y la futura Ley N° 21.719, tienes derecho a:
- Acceso: solicitar información sobre los datos personales que tenemos de ti.
- Rectificación: corregir datos inexactos o desactualizados.
- Cancelación/Supresión: solicitar la eliminación de tus datos cuando ya no sean necesarios o retires tu consentimiento.
- Oposición: oponerte al tratamiento de tus datos en determinadas circunstancias.
- Portabilidad (desde dic. 2026): recibir tus datos en formato estructurado y de uso común.

Para ejercer estos derechos, escríbenos a soporte@worki.cl con el asunto "Derechos ARCO". Responderemos en un plazo máximo de 30 días hábiles.

8. SUSPENSIÓN DE CUENTAS
Worki se reserva el derecho de suspender o eliminar cuentas que violen estos términos, presenten información falsa o sean reportadas reiteradamente por otros usuarios, sin necesidad de previo aviso.

9. MODIFICACIONES
Podemos actualizar estos Términos y Condiciones en cualquier momento. Te notificaremos ante cambios relevantes mediante un aviso en la aplicación o correo electrónico. El uso continuado de la plataforma tras la notificación implica la aceptación de los nuevos términos.

10. LEY APLICABLE Y JURISDICCIÓN
Estos Términos se rigen por las leyes de la República de Chile. Cualquier controversia derivada de su interpretación o cumplimiento será sometida a los tribunales competentes de la ciudad de Santiago de Chile.

11. CONTACTO
Para consultas, soporte o ejercicio de derechos:
Email: soporte@worki.cl`;

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre]                   = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [codigoReferido, setCodigoReferido]   = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [error, setError]                     = useState('');
  const [loading, setLoading]                 = useState(false);
  // Controla si el modal de Términos y Condiciones está visible
  const [modalTerminos, setModalTerminos]     = useState(false);

  const validarPassword = (pwd) => {
    if (pwd.length < 8) return 'La contrasena debe tener al menos 8 caracteres';
    if (!/[A-Z]/.test(pwd)) return 'La contrasena debe tener al menos una mayuscula';
    if (!/[a-z]/.test(pwd)) return 'La contrasena debe tener al menos una minuscula';
    if (!/\d/.test(pwd)) return 'La contrasena debe tener al menos un numero';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) return 'La contrasena debe tener al menos un caracter especial (!@#$%...)';
    return null;
  };

  const handleRegistro = async () => {
    setError('');

    if (!nombre.trim()) { setError('El nombre es obligatorio'); return; }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('El email no tiene formato valido');
      return;
    }

    const errorPassword = validarPassword(password);
    if (errorPassword) { setError(errorPassword); return; }

    if (password !== confirmarPassword) { setError('Las contrasenas no coinciden'); return; }

    setLoading(true);
    try {
      await registro(nombre, email, password, codigoReferido || null);
      navigation.navigate('Login', { mensajeExito: 'Cuenta creada. Revisa tu email para verificarla.' });
    } catch (e) {
      setError(e.response?.data?.error || 'Error al registrarse. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.pantalla}>
      <LinearGradient
        colors={GRADIENTS.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitulo}>Worki</Text>
        <Text style={styles.headerSubtitulo}>Crea tu cuenta gratis</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.formulario} keyboardShouldPersistTaps="handled">
          <Text style={styles.titulo}>Crear cuenta</Text>
          <Text style={styles.subtitulo}>Completa tus datos para registrarte</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            placeholderTextColor={COLORS.textMuted}
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputTexto}
              placeholder="Contrasena"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!mostrarPassword}
            />
            <TouchableOpacity onPress={() => setMostrarPassword(!mostrarPassword)} style={styles.ojito}>
              <Ionicons name={mostrarPassword ? 'eye-off' : 'eye'} size={22} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>
            Minimo 8 caracteres, una mayuscula, una minuscula, un numero y un caracter especial
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputTexto}
              placeholder="Confirmar contrasena"
              placeholderTextColor={COLORS.textMuted}
              value={confirmarPassword}
              onChangeText={setConfirmarPassword}
              secureTextEntry={!mostrarConfirmar}
            />
            <TouchableOpacity onPress={() => setMostrarConfirmar(!mostrarConfirmar)} style={styles.ojito}>
              <Ionicons name={mostrarConfirmar ? 'eye-off' : 'eye'} size={22} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Codigo de referido (opcional)"
            placeholderTextColor={COLORS.textMuted}
            value={codigoReferido}
            onChangeText={setCodigoReferido}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.boton} onPress={handleRegistro} disabled={loading}>
            {loading
              ? <ActivityIndicator color={COLORS.surface} />
              : <Text style={styles.botonTexto}>Crear cuenta</Text>
            }
          </TouchableOpacity>

          {/* Aviso de T&C: texto plano con la parte clickeable en azul */}
          <Text style={styles.aviso}>
            Al registrarte aceptas nuestros{' '}
            <Text style={styles.avisoLink} onPress={() => setModalTerminos(true)}>
              Términos y Condiciones
            </Text>
          </Text>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Ya tienes cuenta? <Text style={styles.linkNegrita}>Inicia sesion</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal que muestra el texto completo de Términos y Condiciones */}
      <Modal
        visible={modalTerminos}
        animationType="slide"       // se desliza desde abajo, se siente nativo
        onRequestClose={() => setModalTerminos(false)}  // botón atrás en Android
      >
        <SafeAreaView style={styles.modalContenedor}>
          {/* Encabezado del modal con botón de cierre */}
          <View style={styles.modalEncabezado}>
            <Text style={styles.modalTitulo}>Términos y Condiciones</Text>
            <TouchableOpacity onPress={() => setModalTerminos(false)} style={styles.modalBotonCerrar}>
              <Ionicons name="close" size={26} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Texto de T&C dentro de un ScrollView para que sea desplazable */}
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContenido}>
            <Text style={styles.modalTexto}>{TERMINOS_TEXTO}</Text>
          </ScrollView>

          {/* Botón inferior para cerrar el modal */}
          <TouchableOpacity style={styles.modalBotonAceptar} onPress={() => setModalTerminos(false)}>
            <Text style={styles.modalBotonAceptarTexto}>Entendido</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.background },

  header: {
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius:  RADII.full,
    borderBottomRightRadius: RADII.full,
    alignItems: 'center',
  },
  headerTitulo:    { color: COLORS.surface, fontSize: 38, fontWeight: '800' },
  headerSubtitulo: { color: COLORS.primaryLight, fontSize: 14, marginTop: 6 },

  formulario: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },

  titulo:    { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  subtitulo: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 },

  input: {
    borderWidth:     1,
    borderColor:     COLORS.border,
    borderRadius:    RADII.md,
    padding:         14,
    marginBottom:    16,
    fontSize:        15,
    backgroundColor: COLORS.surface,
    color:           COLORS.textPrimary,
  },
  inputContainer: {
    flexDirection:   'row',
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     COLORS.border,
    borderRadius:    RADII.md,
    marginBottom:    8,
    backgroundColor: COLORS.surface,
  },
  inputTexto: { flex: 1, padding: 14, fontSize: 15, color: COLORS.textPrimary },
  ojito:      { padding: 14 },

  hint:  { fontSize: 12, color: COLORS.textMuted, marginBottom: 16, marginTop: 2 },
  error: { color: COLORS.error, marginBottom: 12, textAlign: 'center', fontSize: 13 },

  boton: {
    backgroundColor: COLORS.primary,
    padding:         16,
    borderRadius:    RADII.md,
    alignItems:      'center',
    marginBottom:    20,
    marginTop:       8,
    ...SHADOWS.boton,
  },
  botonTexto: { color: COLORS.surface, fontSize: 16, fontWeight: '700' },

  link:        { textAlign: 'center', color: COLORS.textSecondary, fontSize: 14 },
  linkNegrita: { color: COLORS.primary, fontWeight: '700' },

  // Aviso de T&C debajo del botón "Crear cuenta"
  aviso:     { textAlign: 'center', color: COLORS.textMuted, fontSize: 12, marginBottom: 16 },
  avisoLink: { color: COLORS.primary, fontWeight: '600', textDecorationLine: 'underline' },

  // Contenedor principal del Modal (ocupa toda la pantalla)
  modalContenedor: { flex: 1, backgroundColor: COLORS.background },

  // Fila superior con título y botón de cerrar (X)
  modalEncabezado: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical:   14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitulo:      { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  modalBotonCerrar: { padding: 4 },

  // Área de texto desplazable
  modalScroll:          { flex: 1 },
  modalScrollContenido: { padding: 20 },
  modalTexto:           { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },

  // Botón "Entendido" al pie del modal
  modalBotonAceptar: {
    backgroundColor: COLORS.primary,
    margin:          20,
    padding:         16,
    borderRadius:    RADII.md,
    alignItems:      'center',
    ...SHADOWS.boton,
  },
  modalBotonAceptarTexto: { color: COLORS.surface, fontSize: 16, fontWeight: '700' },
});
