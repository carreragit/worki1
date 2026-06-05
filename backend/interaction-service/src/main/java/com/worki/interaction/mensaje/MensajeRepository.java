package com.worki.interaction.mensaje;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MensajeRepository extends JpaRepository<Mensaje, Long> {

    // Carga el historial del chat de una solicitud en orden cronológico
    List<Mensaje> findBySolicitudIdOrderByCreatedAtAsc(Long solicitudId);
}
