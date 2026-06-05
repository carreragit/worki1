package com.worki.user.oficio;

import com.worki.user.oficio.dto.OficioRequestDTO;
import com.worki.user.oficio.dto.OficioResponseDTO;
import com.worki.user.perfil.Perfil;
import com.worki.user.perfil.PerfilRepository;
import com.worki.user.trabajador.Trabajador;
import com.worki.user.trabajador.TrabajadorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OficioService {

    private final OficioRepository oficioRepository;
    private final OficioMapper oficioMapper;
    private final TrabajadorRepository trabajadorRepository;
    private final PerfilRepository perfilRepository;

    public OficioResponseDTO crear(OficioRequestDTO dto) {
        Oficio oficio = oficioMapper.toEntity(dto);
        return oficioMapper.toDTO(oficioRepository.save(oficio));
    }

    public List<OficioResponseDTO> obtenerTodos() {
        return oficioRepository.findAll()
                .stream()
                .map(oficioMapper::toDTO)
                .collect(Collectors.toList());
    }

    public OficioResponseDTO obtenerPorId(Long id) {
        Oficio oficio = oficioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Oficio no encontrado con id: " + id));
        OficioResponseDTO dto = oficioMapper.toDTO(oficio);
        enriquecerConPerfil(dto);
        return dto;
    }

    public List<OficioResponseDTO> obtenerPorTrabajador(Long trabajadorId) {
        return oficioRepository.findByTrabajadorId(trabajadorId)
                .stream()
                .map(o -> {
                    OficioResponseDTO dto = oficioMapper.toDTO(o);
                    enriquecerConPerfil(dto);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<OficioResponseDTO> buscarPorEspecialidad(String especialidad) {
        return oficioRepository.findByEspecialidadContainingIgnoreCase(especialidad)
                .stream()
                .map(oficioMapper::toDTO)
                .collect(Collectors.toList());
    }

    // Devuelve oficios activos para el mapa con coordenadas del trabajador incluidas,
    // filtrados por distancia respecto a la ubicación del cliente
    public List<OficioResponseDTO> obtenerParaMapa(Double clienteLatitud, Double clienteLongitud,
                                                    Double clienteRadioKm, String especialidad) {
        List<Oficio> oficios = especialidad != null
                ? oficioRepository.findByActivoTrueAndEspecialidadContainingIgnoreCase(especialidad)
                : oficioRepository.findByActivoTrue();

        // Carga todos los trabajadores en una sola consulta (IN clause) para evitar el
        // problema N+1: sin esto, cada oficio haría su propia query a la BD
        List<Long> trabajadorIds = oficios.stream()
                .map(Oficio::getTrabajadorId)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, Trabajador> trabajadoresPorId = trabajadorRepository.findAllById(trabajadorIds)
                .stream()
                .collect(Collectors.toMap(Trabajador::getId, t -> t));

        // Igual que con trabajadores: cargamos todos los perfiles necesarios de una vez
        List<Long> perfilIds = trabajadoresPorId.values().stream()
                .map(Trabajador::getPerfilId)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, Perfil> perfilesPorPerfilId = perfilRepository.findAllById(perfilIds)
                .stream()
                .collect(Collectors.toMap(
                    com.worki.user.perfil.Perfil::getId,
                    p -> p
                ));

        return oficios.stream()
                .filter(o -> {
                    Trabajador t = trabajadoresPorId.get(o.getTrabajadorId());
                    if (t == null) return false;
                    double distancia = calcularDistanciaKm(clienteLatitud, clienteLongitud,
                            t.getLatitud(), t.getLongitud());
                    // El trabajador aparece si está dentro del radio del cliente
                    // y el cliente está dentro del radio de cobertura del trabajador
                    return distancia <= clienteRadioKm && distancia <= t.getRadioKm();
                })
                .map(o -> {
                    OficioResponseDTO dto = oficioMapper.toDTO(o);
                    Trabajador t = trabajadoresPorId.get(o.getTrabajadorId());
                    dto.setLatitud(t.getLatitud());
                    dto.setLongitud(t.getLongitud());
                    dto.setRadioKm(t.getRadioKm());
                    com.worki.user.perfil.Perfil perfil = perfilesPorPerfilId.get(t.getPerfilId());
                    if (perfil != null) {
                        dto.setNombreTrabajador(perfil.getNombreCompleto());
                        dto.setFotoPerfil(perfil.getFotoPerfil());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // Uso Haversine porque es la fórmula estándar para calcular distancias entre dos
    // puntos sobre la superficie de la Tierra usando sus coordenadas de latitud y longitud.
    // A diferencia de la distancia euclidiana simple, Haversine considera la curvatura
    // terrestre, lo que la hace precisa para distancias cortas como las de esta app (< 100 km).
    private double calcularDistanciaKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // Cambia el estado activo de un oficio individual
    public OficioResponseDTO cambiarActivo(Long id, boolean activo) {
        Oficio oficio = oficioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Oficio no encontrado con id: " + id));
        oficio.setActivo(activo);
        return oficioMapper.toDTO(oficioRepository.save(oficio));
    }

    // Desactiva todos los oficios de un trabajador de un golpe
    public void desactivarTodos(Long trabajadorId) {
        oficioRepository.desactivarTodosPorTrabajador(trabajadorId);
    }

    public OficioResponseDTO actualizar(Long id, OficioRequestDTO dto) {
        Oficio oficio = oficioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Oficio no encontrado con id: " + id));
        oficioMapper.updateEntity(oficio, dto);
        return oficioMapper.toDTO(oficioRepository.save(oficio));
    }

    // Llamado internamente por interaction-service tras cada calificacion registrada
    public void actualizarPromedio(Long id, Double promedio, Integer totalCalificaciones) {
        Oficio oficio = oficioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Oficio no encontrado con id: " + id));
        oficio.setPromedioCalificacion(promedio);
        oficio.setTotalCalificaciones(totalCalificaciones);
        oficioRepository.save(oficio);
    }

    public void eliminar(Long id) {
        if (!oficioRepository.existsById(id)) {
            throw new RuntimeException("Oficio no encontrado con id: " + id);
        }
        oficioRepository.deleteById(id);
    }

    // Agrega nombre y foto al DTO consultando Perfil a través del Trabajador.
    // Se usa cuando se trae un solo oficio (obtenerPorId, obtenerPorTrabajador);
    // para listas grandes se prefiere la carga batch de obtenerParaMapa.
    private void enriquecerConPerfil(OficioResponseDTO dto) {
        trabajadorRepository.findById(dto.getTrabajadorId()).ifPresent(t ->
            perfilRepository.findById(t.getPerfilId()).ifPresent(p -> {
                dto.setNombreTrabajador(p.getNombreCompleto());
                dto.setFotoPerfil(p.getFotoPerfil());
            })
        );
    }
}
