package com.worki.user.trabajador;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrabajadorRepository extends JpaRepository<Trabajador, Long> {

    Optional<Trabajador> findByPerfilId(Long perfilId);

    List<Trabajador> findByDisponibleTrue();

    List<Trabajador> findByEspecialidadContainingIgnoreCase(String especialidad);
}
