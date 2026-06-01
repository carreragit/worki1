-- ====================================================================
-- SCRIPT DE INICIALIZACIÓN DE DATOS (MOCK DATA) - USER SERVICE
-- ====================================================================

-- 1. POBLAR PERFILES (perfiles de usuario, tanto clientes como trabajadores)
INSERT IGNORE INTO perfiles (
    id, 
    usuario_id, 
    nombre_completo, 
    telefono, 
    foto_perfil, 
    descripcion, 
    fecha_nacimiento, 
    ciudad, 
    region
) VALUES 
-- Cliente (Benjamín)
(
    1, 
    1, 
    'Benjamín Cortés', 
    '+56987654321', 
    NULL, 
    'Cliente registrado activo para solicitud de servicios del hogar.', 
    '1995-04-12', 
    'Santiago', 
    'Metropolitana'
),
-- Trabajador (Héctor Silva)
(
    2, 
    2, 
    'Héctor Silva', 
    '+56911112222', 
    NULL, 
    'Técnico certificado con más de 5 años realizando servicios de instalación y reparación de redes de agua caliente y fría, calefonts, mantención de griferías, fugas y emergencias las 24 horas.', 
    '1988-08-20', 
    'Santiago', 
    'Metropolitana'
);

-- 2. POBLAR TRABAJADORES (Enlaza el perfil 2 como trabajador e ingresa coordenadas y cobertura)
INSERT IGNORE INTO trabajadores (
    id, 
    perfil_id, 
    latitud, 
    longitud, 
    radio_km
) VALUES 
(
    1, 
    2, 
    -33.4372, 
    -70.6506, 
    8.0
);

-- 3. POBLAR OFICIOS / PUBLICACIONES (Enlaza al trabajador 1 con el oficio de Gasfíter)
INSERT IGNORE INTO oficios (
    id, 
    trabajador_id, 
    especialidad, 
    nombre_servicio, 
    descripcion_servicio, 
    tarifa_hora, 
    tarifa_servicio_base, 
    activo, 
    promedio_calificacion, 
    total_calificaciones
) VALUES 
(
    1, 
    1, 
    'Gasfíter', 
    'Instalación y reparación de Calefonts y cañerías', 
    'Técnico certificado con más de 5 años realizando servicios de instalación y reparación de redes de agua caliente y fría, calefonts, mantención de griferías, fugas y emergencias las 24 horas. Garantía por escrito en todos mis trabajos.', 
    15000, 
    25000, 
    1, 
    4.8, 
    67
);
