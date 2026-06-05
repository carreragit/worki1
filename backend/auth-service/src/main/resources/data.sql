-- ====================================================================
-- SCRIPT DE INICIALIZACIÓN DE DATOS (MOCK DATA) - AUTH SERVICE
-- ====================================================================

-- 1. POBLAR USUARIOS (usuarios de autenticación)
-- La contraseña de prueba para ambos usuarios es "123456" hasheada con BCrypt
INSERT IGNORE INTO usuarios (
    id, 
    email, 
    password, 
    nombre, 
    rol, 
    email_verificado, 
    codigo_referido_propio, 
    fecha_creacion
) VALUES 
-- Cliente (Benjamín)
(
    1, 
    'benjamin@worki.cl', 
    '$2a$10$8.UnVuG9HHgffUDAlk8q2OuZyFEX7Y8.w5nFv1Y7N.j2H1O1bO3tG', 
    'Benjamín', 
    'USUARIO', 
    1, 
    'BENJA123', 
    NOW()
),
-- Trabajador (Héctor Silva)
(
    2, 
    'hector@worki.cl', 
    '$2a$10$8.UnVuG9HHgffUDAlk8q2OuZyFEX7Y8.w5nFv1Y7N.j2H1O1bO3tG', 
    'Héctor Silva', 
    'USUARIO', 
    1, 
    'HECTOR12', 
    NOW()
);
