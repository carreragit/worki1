package com.worki.interaction.solicitud;

/**
 * Estados posibles de una solicitud de trabajo.
 */
public enum EstadoSolicitud {

    /** Solicitud enviada, esperando respuesta del trabajador */
    PENDIENTE,

    /** El trabajador aceptó la solicitud */
    ACEPTADA,

    /** El técnico llegó y el código fue verificado; el servicio está en curso */
    EN_PROCESO,

    /** El trabajador rechazó la solicitud */
    RECHAZADA,

    /** El trabajo fue completado exitosamente */
    COMPLETADA,

    /** La solicitud fue cancelada por el cliente o el trabajador */
    CANCELADA
}
