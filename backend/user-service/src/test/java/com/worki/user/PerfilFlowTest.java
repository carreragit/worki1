package com.worki.user;

import org.junit.jupiter.api.*;
import org.springframework.http.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Tests E2E del flujo de perfiles en user-service.
 *
 * REQUISITO: levantar los servicios con perfil test antes de correr:
 *   .\mvnw -pl gateway spring-boot:run
 *   .\mvnw -pl auth-service spring-boot:run -Dspring-boot.run.profiles=local,test
 *   .\mvnw -pl user-service spring-boot:run -Dspring-boot.run.profiles=local,test
 *
 * Correr con: .\mvnw -pl user-service test
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class PerfilFlowTest {

    static final String GATEWAY   = "http://localhost:8080";
    static final RestTemplate http = new RestTemplate();

    static String jwt;
    static Long   usuarioId;
    static Long   perfilId;
    static Long   trabajadorId;
    static Long   oficioId;

    @BeforeAll
    static void setup() {
        try {
            http.getForObject(GATEWAY + "/api/auth/login", Object.class);
        } catch (HttpClientErrorException e) {
            // cualquier respuesta HTTP significa que el servicio está corriendo
        } catch (Exception e) {
            Assumptions.abort("Gateway no disponible en " + GATEWAY + ". Levanta los servicios antes de correr los tests E2E.");
        }

        String email    = "perfil-" + UUID.randomUUID().toString().substring(0, 8) + "@worki.test";
        String password = "Password1!";

        // registro — con perfil test el email queda verificado automáticamente
        Map<String, Object> regBody = new HashMap<>();
        regBody.put("nombre", "Perfil Test");
        regBody.put("email", email);
        regBody.put("password", password);
        ResponseEntity<Map> regRes = http.exchange(
            GATEWAY + "/api/auth/registro", HttpMethod.POST, jsonReq(regBody), Map.class
        );
        usuarioId = Long.valueOf(regRes.getBody().get("id").toString());

        // login para obtener JWT
        Map<String, Object> loginBody = new HashMap<>();
        loginBody.put("email", email);
        loginBody.put("password", password);
        ResponseEntity<Map> loginRes = http.exchange(
            GATEWAY + "/api/auth/login", HttpMethod.POST, jsonReq(loginBody), Map.class
        );
        jwt = loginRes.getBody().get("token").toString();
    }

    // ─── Prueba GET /api/perfiles/usuario/{usuarioId} ─────────────────────────
    // El perfil básico se crea automáticamente cuando el usuario se registra en
    // auth-service. Verifica que existe y está vinculado al usuarioId correcto.
    @Test @Order(1)
    void obtenerPerfilPorUsuarioId_debeRetornarPerfilCreado() {
        ResponseEntity<Map> res = http.exchange(
            GATEWAY + "/api/perfiles/usuario/" + usuarioId,
            HttpMethod.GET, authReq(null), Map.class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody().get("usuarioId").toString()).isEqualTo(usuarioId.toString());
        assertThat(res.getBody().get("nombreCompleto")).isEqualTo("Perfil Test");

        perfilId = Long.valueOf(res.getBody().get("id").toString());
    }

    // ─── Prueba GET /api/perfiles/{id} ────────────────────────────────────────
    // Obtener el mismo perfil pero por su ID interno en lugar del usuarioId.
    @Test @Order(2)
    void obtenerPerfilPorId_debeRetornarPerfil() {
        assertThat(perfilId).as("perfilId debe haberse obtenido en el test anterior").isNotNull();

        ResponseEntity<Map> res = http.exchange(
            GATEWAY + "/api/perfiles/" + perfilId,
            HttpMethod.GET, authReq(null), Map.class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody().get("id").toString()).isEqualTo(perfilId.toString());
    }

    // ─── Prueba PUT /api/perfiles/{id} ────────────────────────────────────────
    // Actualiza ciudad, teléfono y nombre del perfil.
    // Verifica que los cambios se persisten correctamente.
    @Test @Order(3)
    void actualizarPerfil_debeReflejarLosCambios() {
        assertThat(perfilId).as("perfilId debe haberse obtenido en el test anterior").isNotNull();

        Map<String, Object> body = new HashMap<>();
        body.put("usuarioId", usuarioId);
        body.put("nombreCompleto", "Perfil Actualizado");
        body.put("ciudad", "Santiago");
        body.put("telefono", "+56912345678");
        body.put("descripcion", "Descripción de prueba");

        ResponseEntity<Map> res = http.exchange(
            GATEWAY + "/api/perfiles/" + perfilId,
            HttpMethod.PUT, authReq(body), Map.class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody().get("nombreCompleto")).isEqualTo("Perfil Actualizado");
        assertThat(res.getBody().get("ciudad")).isEqualTo("Santiago");
        assertThat(res.getBody().get("telefono")).isEqualTo("+56912345678");
    }

    // ─── Prueba GET /api/perfiles/usuario/{id} con ID inexistente ─────────────
    // Buscar el perfil de un usuario que no existe debe devolver 404.
    @Test @Order(4)
    void obtenerPerfilInexistente_debeRetornar404() {
        assertThatThrownBy(() ->
            http.exchange(
                GATEWAY + "/api/perfiles/usuario/999999",
                HttpMethod.GET, authReq(null), Map.class
            )
        ).isInstanceOf(HttpClientErrorException.NotFound.class);
    }

    // ─── Prueba POST /api/trabajadores ────────────────────────────────────────
    // Registra al usuario como trabajador con ubicación y radio de cobertura.
    @Test @Order(5)
    void registrarTrabajador_debeRetornar201() {
        assertThat(perfilId).isNotNull();

        Map<String, Object> body = new HashMap<>();
        body.put("perfilId", perfilId);
        body.put("latitud", -33.45);
        body.put("longitud", -70.65);
        body.put("radioKm", 10.0);

        ResponseEntity<Map> res = http.exchange(
            GATEWAY + "/api/trabajadores", HttpMethod.POST, authReq(body), Map.class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(res.getBody()).containsKey("id");

        trabajadorId = Long.valueOf(res.getBody().get("id").toString());
    }

    // ─── Prueba GET /api/trabajadores ─────────────────────────────────────────
    // Lista todos los trabajadores. Debe contener al menos el que acabamos de crear.
    @Test @Order(6)
    void listarTrabajadores_debeRetornarLista() {
        ResponseEntity<Object[]> res = http.exchange(
            GATEWAY + "/api/trabajadores", HttpMethod.GET, authReq(null), Object[].class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).isNotEmpty();
    }

    // ─── Prueba GET /api/trabajadores/{id} ────────────────────────────────────
    // Obtiene el trabajador recién creado por su ID.
    @Test @Order(7)
    void obtenerTrabajadorPorId_debeRetornarTrabajador() {
        assertThat(trabajadorId).isNotNull();

        ResponseEntity<Map> res = http.exchange(
            GATEWAY + "/api/trabajadores/" + trabajadorId,
            HttpMethod.GET, authReq(null), Map.class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody().get("id").toString()).isEqualTo(trabajadorId.toString());
    }

    // ─── Prueba POST /api/oficios ─────────────────────────────────────────────
    // Crea un oficio para el trabajador con especialidad y tarifa.
    @Test @Order(8)
    void crearOficio_debeRetornar201() {
        assertThat(trabajadorId).isNotNull();

        Map<String, Object> body = new HashMap<>();
        body.put("trabajadorId", trabajadorId);
        body.put("especialidad", "Electricidad");
        body.put("nombreServicio", "Instalación eléctrica");
        body.put("descripcionServicio", "Instalación y reparación de circuitos eléctricos");
        body.put("tarifaHora", 20000);

        ResponseEntity<Map> res = http.exchange(
            GATEWAY + "/api/oficios", HttpMethod.POST, authReq(body), Map.class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(res.getBody().get("especialidad")).isEqualTo("Electricidad");

        oficioId = Long.valueOf(res.getBody().get("id").toString());
    }

    // ─── Prueba GET /api/oficios ──────────────────────────────────────────────
    // Lista todos los oficios. Debe contener al menos el que acabamos de crear.
    @Test @Order(9)
    void listarOficios_debeRetornarLista() {
        ResponseEntity<Object[]> res = http.exchange(
            GATEWAY + "/api/oficios", HttpMethod.GET, authReq(null), Object[].class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).isNotEmpty();
    }

    // ─── Prueba GET /api/oficios/{id} ─────────────────────────────────────────
    // Obtiene el oficio recién creado por su ID.
    @Test @Order(10)
    void obtenerOficioPorId_debeRetornarOficio() {
        assertThat(oficioId).isNotNull();

        ResponseEntity<Map> res = http.exchange(
            GATEWAY + "/api/oficios/" + oficioId,
            HttpMethod.GET, authReq(null), Map.class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody().get("id").toString()).isEqualTo(oficioId.toString());
    }

    // ─── Prueba GET /api/oficios/trabajador/{trabajadorId} ───────────────────
    // Lista los oficios del trabajador. Debe devolver el oficio recién creado.
    @Test @Order(11)
    void listarOficiosPorTrabajador_debeRetornarSusOficios() {
        assertThat(trabajadorId).isNotNull();

        ResponseEntity<Object[]> res = http.exchange(
            GATEWAY + "/api/oficios/trabajador/" + trabajadorId,
            HttpMethod.GET, authReq(null), Object[].class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).isNotEmpty();
    }

    // ─── Prueba GET /api/oficios/buscar?especialidad=Electricidad ────────────
    // Busca oficios por especialidad. Debe encontrar el que creamos.
    @Test @Order(12)
    void buscarOficiosPorEspecialidad_debeRetornarCoincidencias() {
        ResponseEntity<Object[]> res = http.exchange(
            GATEWAY + "/api/oficios/buscar?especialidad=Electricidad",
            HttpMethod.GET, authReq(null), Object[].class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).isNotEmpty();
    }

static HttpEntity<Object> authReq(Object body) {
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
