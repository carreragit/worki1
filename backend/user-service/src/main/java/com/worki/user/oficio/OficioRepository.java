package com.worki.user.oficio;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface OficioRepository extends JpaRepository<Oficio, Long> {

    List<Oficio> findByTrabajadorId(Long trabajadorId);

    List<Oficio> findByEspecialidadContainingIgnoreCase(String especialidad);

    // Oficios activos para el mapa, opcionalmente filtrados por especialidad
    List<Oficio> findByActivoTrue();

    List<Oficio> findByActivoTrueAndEspecialidadContainingIgnoreCase(String especialidad);

    // Desactiva todos los oficios de un trabajador 
    @Modifying
    @Transactional
    @Query("UPDATE Oficio o SET o.activo = false WHERE o.trabajadorId = :trabajadorId")
    void desactivarTodosPorTrabajador(@Param("trabajadorId") Long trabajadorId);
}
