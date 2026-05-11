package com.worki.auth.repositories;

import com.worki.auth.models.Referido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReferidoRepository extends JpaRepository<Referido, Long> {

    List<Referido> findByIdReferidor(Long idReferidor);

    long countByIdReferidor(Long idReferidor);

    boolean existsByIdReferido(Long idReferido);
}
