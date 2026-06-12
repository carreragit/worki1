package com.worki.user.certificado;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CertificadoRepository extends JpaRepository<Certificado, Long> {
    List<Certificado> findByOficioId(Long oficioId);
}
