package com.worki.user.evidencia;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EvidenciaRepository extends JpaRepository<Evidencia, Long> {
    List<Evidencia> findByOficioId(Long oficioId);
}
