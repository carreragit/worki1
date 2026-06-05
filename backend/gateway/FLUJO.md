# Flujo del Gateway

El gateway es el unico punto de entrada para todo el trafico externo.
Ningun microservicio es accesible directamente desde el frontend - todo pasa por aqui.

---

## Flujo de una request

```
Cliente (frontend / app)
        |
        | HTTP request con o sin JWT
        v
Gateway :8080
        |
        |-- Es ruta publica? (ver lista abajo)
        |       |
        |      SI -> reenviar directo al microservicio sin validar nada
        |       |
        |      NO -> Tiene header "Authorization: Bearer <token>"?
        |               |
        |              NO -> responder 401 Unauthorized (corta aqui)
        |               |
        |              SI -> token es valido y no esta expirado?
        |                       |
        |                      NO -> responder 401 Unauthorized (corta aqui)
        |                       |
        |                      SI -> inyectar headers en el request:
        |                               X-User-Id    = id del usuario
        |                               X-User-Email = email del usuario
        |                               X-User-Role  = rol (USUARIO / ADMIN)
        |                            reenviar al microservicio
        v
Microservicio correspondiente
(auth :8081 | usuarios :8082 | interacciones :8084)
        |
        | El microservicio lee los headers X-User-* directamente
        | NO vuelve a validar el JWT - confia en el gateway
        v
Respuesta al cliente
```

---

## Rutas publicas (sin JWT)

Estas rutas pasan directo sin ningun tipo de validacion:

| Metodo | Ruta                           | Descripcion                        |
|--------|--------------------------------|------------------------------------|
| POST   | /api/auth/login                | Iniciar sesion                     |
| POST   | /api/auth/registro             | Crear cuenta                       |
| GET    | /api/auth/verificar-email      | Verificar email con token de correo|
| POST   | /api/auth/recuperar-password   | Solicitar link de recuperacion     |
| POST   | /api/auth/reset-password       | Cambiar password con token         |

Todo lo demas requiere JWT valido.

---

## Headers que inyecta el gateway

Cuando el JWT es valido, el gateway agrega estos headers antes de reenviar al microservicio:

| Header        | Contenido              | Ejemplo          |
|---------------|------------------------|------------------|
| X-User-Id     | ID del usuario (Long)  | 42               |
| X-User-Email  | Email del usuario      | user@ejemplo.com |
| X-User-Role   | Rol del usuario        | USUARIO o ADMIN  |

Los microservicios leen estos headers para saber quien esta haciendo la request,
sin necesidad de tocar ni conocer el JWT.

---

## Enrutamiento

| Path del request      | Microservicio destino     | Puerto |
|-----------------------|---------------------------|--------|
| /api/auth/**          | auth-service              | 8081   |
| /api/usuarios/**      | user-service              | 8082   |
| /api/interacciones/** | interaction-service       | 8084   |

---

## Respuestas de error del gateway

| Codigo | Cuando ocurre                                      |
|--------|----------------------------------------------------|
| 401    | No hay token, el token es invalido o esta expirado |
| 503    | El microservicio destino no esta corriendo         |
