package com.worki.interaction.solicitud;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {

    /** Todas las solicitudes enviadas por un cliente */
    List<Solicitud> findByClienteId(Long clienteId);

    /** Todas las solicitudes recibidas por un trabajador */
    List<Solicitud> findByTrabajadorId(Long trabajadorId);

    /** Solicitudes de un trabajador filtradas por estado */
    List<Solicitud> findByTrabajadorIdAndEstado(Long trabajadorId, EstadoSolicitud estado);

    /** Solicitudes de un cliente filtradas por estado */
    List<Solicitud> findByClienteIdAndEstado(Long clienteId, EstadoSolicitud estado);

    /** Comprueba si ya existe una solicitud pendiente/aceptada entre cliente y oficio */
    boolean existsByClienteIdAndOficioIdAndEstadoIn(Long clienteId, Long oficioId, List<EstadoSolicitud> estados);
}
