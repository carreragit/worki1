package com.worki.interaction;

import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.junit.jupiter.api.*;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Tests E2E del flujo completo de interacciones:
 *   cliente solicita → trabajador acepta → se completa → cliente califica.
 *
 * REQUISITO: levantar todos los servicios con perfil test antes de correr:
 *   .\mvnw -pl gateway spring-boot:run
 *   .\mvnw -pl auth-service spring-boot:run -Dspring-boot.run.profiles=local,test
 *   .\mvnw -pl user-service spring-boot:run -Dspring-boot.run.profiles=local,test
 *   .\mvnw -pl interaction-service spring-boot:run -Dspring-boot.run.profiles=local,test
 *
 * Correr con: .\mvnw -pl interaction-service test
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class SolicitudFlowTest {

    static final String GATEWAY   = "http://localhost:8080";
    static final RestTemplate http = new RestTemplate(
        new HttpComponentsClientHttpRequestFactory(HttpClients.createDefault())
    );

    // IDs compartidos entre tests — se pueblan en @BeforeAll y en tests previos
    static String jwtCliente;
    static String jwtTrabajador;
    static Long   clientePerfilId;
    static Long   trabajadorEntityId;
    static Long   oficioId;
    static Long   solicitudId;
    static Long   calificacionId;

    @BeforeAll
    static void setup() {
        try {
            http.getForObject(GATEWAY + "/api/auth/login", Object.class);
        } catch (HttpClientErrorException e) {
            // cualquier respuesta HTTP significa que el servicio está corriendo
        } catch (Exception e) {
            Assumptions.abort("Gateway no disponible en " + GATEWAY + ". Levanta los servicios antes de correr los tests E2E.");
        }

        String suffix         = UUID.randomUUID().toString().substring(0, 8);
        String emailCliente   = "cliente-" + suffix + "@worki.test";
        String emailTrabajador = "trab-" + suffix + "@worki.test";
        String password       = "Password1!";

        // registrar cliente — con perfil test el email queda verificado automáticamente
        Long clienteUsuarioId = registrar("Cliente Test", emailCliente, password);
        jwtCliente = login(emailCliente, password);

        // registrar trabajador
        Long trabajadorUsuarioId = registrar("Trabajador Test", emailTrabajador, password);
        jwtTrabajador = login(emailTrabajador, password);

        // obtener perfil del cliente para sacar su perfilId (es el clienteId en solicitud)
        ResponseEntity<Map> perfilCliente = http.exchange(
            GATEWAY + "/api/perfiles/usuario/" + clienteUsuarioId,
            HttpMethod.GET, authReq(null, jwtCliente), Map.class
        );
        clientePerfilId = Long.valueOf(perfilCliente.getBody().get("id").toString());

        // obtener perfil del trabajador para registrarlo como entidad Trabajador
        ResponseEntity<Map> perfilTrabajador = http.exchange(
            GATEWAY + "/api/perfiles/usuario/" + trabajadorUsuarioId,
            HttpMethod.GET, authReq(null, jwtTrabajador), Map.class
        );
        Long trabajadorPerfilId = Long.valueOf(perfilTrabajador.getBody().get("id").toString());

        // registrar al trabajador con ubicación y radio de cobertura
        Map<String, Object> trabajadorBody = new HashMap<>();
        trabajadorBody.put("perfilId", trabajadorPerfilId);
        trabajadorBody.put("latitud", -33.45);
        trabajadorBody.put("longitud", -70.65);
        trabajadorBody.put("radioKm", 15.0);
        ResponseEntity<Map> trabajadorRes = http.exchange(
            GATEWAY + "/api/trabajadores", HttpMethod.POST,
            authReq(trabajadorBody, jwtTrabajador), Map.class
        );
        trabajadorEntityId = Long.valueOf(trabajadorRes.getBody().get("id").toString());

        // crear oficio para el trabajador
        Map<String, Object> oficioBody = new HashMap<>();
        oficioBody.put("trabajadorId", trabajadorEntityId);
        oficioBody.put("especialidad", "Gasfitería");
        oficioBody.put("nombreServicio", "Reparación de cañerías");
        oficioBody.put("descripcionServicio", "Reparación de cañerías y tuberías en domicilio");
        oficioBody.put("tarifaHora", 15000);
        ResponseEntity<Map> oficioRes = http.exchange(
            GATEWAY + "/api/oficios", HttpMethod.POST,
            authReq(oficioBody, jwtTrabajador), Map.class
        );
        oficioId = Long.valueOf(oficioRes.getBody().get("id").toString());
    }

    // ─── Prueba POST /api/interacciones/solicitudes ───────────────────────────
    // El cliente crea una solicitud de servicio al trabajador para un oficio.
    // Debe devolver 201 con la solicitud en estado PENDIENTE.
    @Test @Order(1)
    void crearSolicitud_debeRetornar201ConEstadoPendiente() {
        Map<String, Object> body = new HashMap<>();
        body.put("clienteId", clientePerfilId);
        body.put("trabajadorId", trabajadorEntityId);
        body.put("oficioId", oficioId);
        body.put("descripcion", "Necesito reparar una cañería rota en el baño principal");
        body.put("clienteLatitud", -33.45);
        body.put("clienteLongitud", -70.66);

        ResponseEntity<Map> res = http.exchange(
            GATEWAY + "/api/interacciones/solicitudes", HttpMethod.POST,
            authReq(body, jwtCliente), Map.class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(res.getBody().get("estado")).isEqualTo("PENDIENTE");
        assertThat(res.getBody()).containsKey("id");

        solicitudId = Long.valueOf(res.getBody().get("id").toString());
    }

    // ─── Prueba POST /api/interacciones/solicitudes duplicada ────────────────
    // Crear una segunda solicitud activa al mismo trabajador para el mismo oficio
    // debe devolver 409 CONFLICT.
    @Test @Order(2)
    void crearSolicitudDuplicada_debeRetornar409() {
        Map<String, Object> body = new HashMap<>();
        body.put("clienteId", clientePerfilId);
        body.put("trabajadorId", trabajadorEntityId);
        body.put("oficioId", oficioId);
        body.put("descripcion", "Solicitud duplicada");

        assertThatThrownBy(() ->
            http.exchange(
                GATEWAY + "/api/interacciones/solicitudes", HttpMethod.POST,
                authReq(body, jwtCliente), Map.class
            )
        ).isInstanceOf(HttpClientErrorException.class);
    }

    // ─── Prueba GET /api/interacciones/solicitudes/{id} ──────────────────────
    // Obtener la solicitud recién creada por su ID.
    @Test @Order(3)
    void obtenerSolicitudPorId_debeRetornarLaSolicitud() {
        assertThat(solicitudId).isNotNull();

        ResponseEntity<Map> res = http.exchange(
            GATEWAY + "/api/interacciones/solicitudes/" + solicitudId,
            HttpMethod.GET, authReq(null, jwtCliente), Map.class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody().get("id").toString()).isEqualTo(solicitudId.toString());
        assertThat(res.getBody().get("estado")).isEqualTo("PENDIENTE");
    }

    // ─── Prueba PATCH /api/interacciones/solicitudes/{id}/estado → ACEPTADA ───
    // El trabajador acepta la solicitud. Transición válida: PENDIENTE → ACEPTADA.
    @Test @Order(4)
    void aceptarSolicitud_debeActualizarEstadoAAceptada() {
        assertThat(solicitudId).isNotNull();

        Map<String, Object> body = new HashMap<>();
        body.put("estado", "ACEPTADA");

        ResponseEntity<Map> res = http.exchange(
            GATEWAY + "/api/interacciones/solicitudes/" + solicitudId + "/estado",
            HttpMethod.PATCH, authReq(body, jwtTrabajador), Map.class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody().get("estado")).isEqualTo("ACEPTADA");
    }

    // ─── Prueba PATCH /api/interacciones/solicitudes/{id}/estado → COMPLETADA ─
    // El trabajador marca el servicio como completado. Transición válida: ACEPTADA → COMPLETADA.
    @Test @Order(5)
    void completarSolicitud_debeActualizarEstadoACompletada() {
        Map<String, Object> body = new HashMap<>();
        body.put("estado", "COMPLETADA");

        ResponseEntity<Map> res = http.exchange(
            GATEWAY + "/api/interacciones/solicitudes/" + solicitudId + "/estado",
            HttpMethod.PATCH, authReq(body, jwtTrabajador), Map.class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody().get("estado")).isEqualTo("COMPLETADA");
    }

    // ─── Prueba PATCH estado con transición inválida ──────────────────────────
    // Intentar volver a PENDIENTE desde COMPLETADA debe ser rechazado (estado terminal).
    @Test @Order(6)
    void transicionInvalida_debeSerRechazada() {
        Map<String, Object> body = new HashMap<>();
        body.put("estado", "PENDIENTE");

        assertThatThrownBy(() ->
            http.exchange(
                GATEWAY + "/api/interacciones/solicitudes/" + solicitudId + "/estado",
                HttpMethod.PATCH, authReq(body, jwtTrabajador), Map.class
            )
        ).isInstanceOf(HttpClientErrorException.class);
    }

    // ─── Prueba POST /api/interacciones/calificaciones ───────────────────────
    // El cliente califica al trabajador por el servicio completado.
    // Solo se puede calificar una solicitud en estado COMPLETADA.
    @Test @Order(7)
    void calificarSolicitud_debeRetornar201ConElPuntaje() {
        Map<String, Object> body = new HashMap<>();
        body.put("solicitudId", solicitudId);
        body.put("oficioId", oficioId);
        body.put("evaluadorId", clientePerfilId);
        body.put("evaluadoId", trabajadorEntityId);
        body.put("puntaje", 5);
        body.put("comentario", "Excelente trabajo, muy puntual y prolijo");

        ResponseEntity<Map> res = http.exchange(
            GATEWAY + "/api/interacciones/calificaciones", HttpMethod.POST,
            authReq(body, jwtCliente), Map.class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(res.getBody().get("puntaje")).isEqualTo(5);
        assertThat(res.getBody().get("solicitudId").toString()).isEqualTo(solicitudId.toString());

        calificacionId = Long.valueOf(res.getBody().get("id").toString());
    }

    // ─── Prueba GET /api/interacciones/calificaciones/promedio/oficio/{id} ────
    // Después de calificar, el promedio del oficio debe reflejar la calificación.
    @Test @Order(8)
    void promedioOficio_debeReflejarLaCalificacion() {
        ResponseEntity<Map> res = http.exchange(
            GATEWAY + "/api/interacciones/calificaciones/promedio/oficio/" + oficioId,
            HttpMethod.GET, authReq(null, jwtCliente), Map.class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody().get("totalCalificaciones").toString()).isEqualTo("1");
        assertThat(res.getBody().get("promedio").toString()).isEqualTo("5.0");
    }

    // ─── Prueba GET /api/interacciones/solicitudes/cliente/{clienteId} ───────
    // Lista todas las solicitudes enviadas por el cliente. Debe incluir la creada.
    @Test @Order(9)
    void listarSolicitudesPorCliente_debeRetornarLista() {
        ResponseEntity<Object[]> res = http.exchange(
            GATEWAY + "/api/interacciones/solicitudes/cliente/" + clientePerfilId,
            HttpMethod.GET, authReq(null, jwtCliente), Object[].class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).isNotEmpty();
    }

    // ─── Prueba GET /api/interacciones/solicitudes/trabajador/{trabajadorId} ─
    // Lista todas las solicitudes recibidas por el trabajador.
    @Test @Order(10)
    void listarSolicitudesPorTrabajador_debeRetornarLista() {
        ResponseEntity<Object[]> res = http.exchange(
            GATEWAY + "/api/interacciones/solicitudes/trabajador/" + trabajadorEntityId,
            HttpMethod.GET, authReq(null, jwtTrabajador), Object[].class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).isNotEmpty();
    }

    // ─── Prueba GET /api/interacciones/solicitudes/trabajador/{id}?estado=COMPLETADA
    // Filtra las solicitudes del trabajador por estado COMPLETADA.
    @Test @Order(11)
    void listarSolicitudesPorTrabajadorYEstado_debeRetornarSoloCompletadas() {
        ResponseEntity<Object[]> res = http.exchange(
            GATEWAY + "/api/interacciones/solicitudes/trabajador/" + trabajadorEntityId + "?estado=COMPLETADA",
            HttpMethod.GET, authReq(null, jwtTrabajador), Object[].class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).isNotEmpty();
    }

    // ─── Prueba GET /api/interacciones/calificaciones/{id} ───────────────────
    // Obtiene la calificación creada por su ID.
    @Test @Order(12)
    void obtenerCalificacionPorId_debeRetornarCalificacion() {
        assertThat(calificacionId).isNotNull();

        ResponseEntity<Map> res = http.exchange(
            GATEWAY + "/api/interacciones/calificaciones/" + calificacionId,
            HttpMethod.GET, authReq(null, jwtCliente), Map.class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody().get("id").toString()).isEqualTo(calificacionId.toString());
        assertThat(res.getBody().get("puntaje")).isEqualTo(5);
    }

    // ─── Prueba GET /api/interacciones/calificaciones/solicitud/{solicitudId} ─
    // Lista todas las calificaciones asociadas a la solicitud completada.
    @Test @Order(13)
    void listarCalificacionesPorSolicitud_debeRetornarLista() {
        ResponseEntity<Object[]> res = http.exchange(
            GATEWAY + "/api/interacciones/calificaciones/solicitud/" + solicitudId,
            HttpMethod.GET, authReq(null, jwtCliente), Object[].class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).isNotEmpty();
    }

    // ─── Prueba GET /api/interacciones/calificaciones/usuario/{evaluadoId} ───
    // Lista todas las calificaciones recibidas por el trabajador.
    @Test @Order(14)
    void listarCalificacionesPorEvaluado_debeRetornarLista() {
        ResponseEntity<Object[]> res = http.exchange(
            GATEWAY + "/api/interacciones/calificaciones/usuario/" + trabajadorEntityId,
            HttpMethod.GET, authReq(null, jwtCliente), Object[].class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).isNotEmpty();
    }

    // ─── Prueba GET /api/interacciones/calificaciones/promedio/usuario/{id} ──
    // Devuelve el promedio global de calificaciones recibidas por el trabajador.
    @Test @Order(15)
    void promedioUsuario_debeReflejarLaCalificacion() {
        ResponseEntity<Map> res = http.exchange(
            GATEWAY + "/api/interacciones/calificaciones/promedio/usuario/" + trabajadorEntityId,
            HttpMethod.GET, authReq(null, jwtCliente), Map.class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody().get("totalCalificaciones").toString()).isEqualTo("1");
        assertThat(res.getBody().get("promedio").toString()).isEqualTo("5.0");
    }

    // ─── helpers ─────────────────────────────────────────────────────────────

    static Long registrar(String nombre, String email, String password) {
        Map<String, Object> body = new HashMap<>();
        body.put("nombre", nombre);
        body.put("email", email);
        body.put("password", password);
        ResponseEntity<Map> res = http.exchange(
            GATEWAY + "/api/auth/registro", HttpMethod.POST, jsonReq(body), Map.class
        );
        return Long.valueOf(res.getBody().get("id").toString());
    }

    static String login(String email, String password) {
        Map<String, Object> body = new HashMap<>();
        body.put("email", email);
        body.put("password", password);
        ResponseEntity<Map> res = http.exchange(
            GATEWAY + "/api/auth/login", HttpMethod.POST, jsonReq(body), Map.class
        );
        return res.getBody().get("token").toString();
    }

    static HttpEntity<Object> authReq(Object body, String jwt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + jwt);
        return new HttpEntity<>(body, headers);
    }

    static HttpEntity<Map<String, Object>> jsonReq(Map<String, Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(body, headers);
    }
}
