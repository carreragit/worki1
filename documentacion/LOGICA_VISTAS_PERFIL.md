# Lógica de Negocio y Decisiones de Diseño: Vistas de Perfil

Este documento detalla las reglas de negocio críticas implementadas en el frontend de **Worki** (específicamente para Naomi en el desarrollo de la interfaz de usuario de perfiles y contratación), asociadas al microservicio de **Usuarios** e **Interacciones**.

---

## 📌 Reglas de Negocio Implementadas

### 1. Restricción de Inicio de Chat Directo

> [!IMPORTANT]
> **Regla:** Un usuario no puede iniciar un chat de forma libre o directa al ingresar al perfil de un trabajador. El botón o canal de chat permanecerá deshabilitado o no disponible en el perfil general.

*   **Flujo Requerido:** Para abrir un canal de comunicación (chat), el cliente debe obligatoriamente presionar primero el botón **"Solicitar Servicio"**.
*   **Argumento Técnico y de Negocio:**
    *   **Control de Spam:** Evita el envío masivo de mensajes no solicitados o consultas informales que saturen la bandeja de entrada del trabajador.
    *   **Formalización del Trato:** Garantiza que cada conversación en la base de datos esté respaldada por una intención real de contratación (una solicitud formal). Esto ayuda a trazar métricas de conversión más limpias y claras.

---

### 2. Prevención de Solicitudes Duplicadas (Múltiples)

> [!WARNING]
> **Regla:** Un cliente tiene prohibido enviar una nueva solicitud de servicio a un mismo trabajador si ya existe una solicitud previa en estado `PENDIENTE` entre ambos.

*   **Comportamiento de la Interfaz:** Si el cliente ya tiene una solicitud pendiente con el trabajador, el botón **"Solicitar Servicio"** debe renderizarse deshabilitado (ej. con opacidad reducida y estado *disabled*), mostrando un texto descriptivo como *"Solicitud en Espera"* o *"Tienes una solicitud pendiente con este técnico"*.
*   **Argumento Técnico y de Negocio:**
    *   **Integridad de Datos:** Evita la duplicación accidental de transacciones financieras o de servicio en el backend.
    *   **Optimización de Recursos (Base de Datos):** Previene sobrecargas o cuellos de botella en la base de datos producidos por clics dobles, rápidos o repetitivos por parte de usuarios impacientes.
    *   **Claridad para el Técnico:** Asegura que el tablero del trabajador no se inunde con múltiples registros idénticos del mismo cliente, manteniendo su flujo de trabajo ordenado.

---

## 🛠️ Guía de Implementación en React Frontend

### Estado de Botones (Ejemplo de Lógica)

```jsx
// Ejemplo conceptual en la vista de Perfil
const PerfilTrabajador = ({ trabajador, clienteId }) => {
  const [solicitudPendiente, setSolicitudPendiente] = useState(false);

  useEffect(() => {
    // Llamada al microservicio de interacciones para verificar estado
    interactionService.verificarSolicitudPendiente(clienteId, trabajador.id)
      .then(hasPending => setSolicitudPendiente(hasPending));
  }, [trabajador.id, clienteId]);

  return (
    <div className="perfil-container">
      {/* Información del perfil */}
      
      <div className="acciones-row">
        {/* Botón de solicitar servicio controlado por estado */}
        <button 
          onClick={handleSolicitarServicio}
          disabled={solicitudPendiente}
          className={`btn-primario ${solicitudPendiente ? 'btn-disabled' : ''}`}
        >
          {solicitudPendiente ? 'Solicitud Pendiente' : 'Solicitar Servicio'}
        </button>

        {/* Botón de chat deshabilitado si no hay contrato/solicitud activa */}
        <button 
          onClick={handleAbrirChat}
          disabled={!trabajador.tieneContratoActivo} 
          className="btn-secundario"
        >
          Chatear con el Técnico
        </button>
      </div>
    </div>
  );
};
```
