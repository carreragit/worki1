package com.worki.interaction.solicitud;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {

    List<Solicitud> findByClienteId(Long clienteId);

    List<Solicitud> findByTrabajadorId(Long trabajadorId);

    List<Solicitud> findByTrabajadorIdAndEstado(Long trabajadorId, EstadoSolicitud estado);

    List<Solicitud> findByClienteIdAndEstado(Long clienteId, EstadoSolicitud estado);

    boolean existsByClienteIdAndOficioIdAndEstadoIn(Long clienteId, Long oficioId, List<EstadoSolicitud> estados);

    boolean existsByClienteIdAndTrabajadorIdAndEstadoIn(Long clienteId, Long trabajadorId, List<EstadoSolicitud> estados);
}
