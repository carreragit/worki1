package com.worki.auth;

import org.junit.jupiter.api.*;
import org.springframework.http.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Tests E2E del flujo de autenticación.
 *
 * REQUISITO: levantar los servicios con perfil test antes de correr:
 *   .\mvnw -pl gateway spring-boot:run
 *   .\mvnw -pl auth-service spring-boot:run -Dspring-boot.run.profiles=local,test
 *   .\mvnw -pl user-service spring-boot:run -Dspring-boot.run.profiles=local,test
 *
 * Correr con: .\mvnw -pl auth-service test
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AuthFlowTest {

    static final String GATEWAY  = "http://localhost:8080";
    static final RestTemplate http = new RestTemplate();

    static String email;
    static String jwt;

    @BeforeAll
    static void setup() {
        // email único por ejecución para no colisionar con datos previos en la BD de test
        email = "auth-" + UUID.randomUUID().toString().substring(0, 8) + "@worki.test";

        // si el gateway no responde, marcar todos los tests como SKIPPED en vez de FAILED
        try {
            http.getForObject(GATEWAY + "/api/auth/login", Object.class);
        } catch (HttpClientErrorException e) {
            // cualquier respuesta HTTP (4xx/5xx) significa que el servicio está corriendo
        } catch (Exception e) {
            Assumptions.abort("Gateway no disponible en " + GATEWAY + ". Levanta los servicios antes de correr los tests E2E.");
        }
    }

    // ─── Prueba POST /api/auth/registro ───────────────────────────────────────
    // Crea una cuenta nueva con datos válidos. Con perfil test el email queda
    // verificado automáticamente, así que emailVerificado debe venir true.
    @Test @Order(1)
    void registro_debeCrearUsuarioYRetornar201() {
        Map<String, Object> body = new HashMap<>();
        body.put("nombre", "Test User");
        body.put("email", email);
        body.put("password", "Password1!");

        ResponseEntity<Map> res = http.exchange(
            GATEWAY + "/api/auth/registro", HttpMethod.POST, jsonReq(body), Map.class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(res.getBody()).containsKey("id");
        assertThat(res.getBody().get("emailVerificado")).isEqualTo(true);
    }

    // ─── Prueba POST /api/auth/login con credenciales correctas ───────────────
    // Con el email ya verificado (perfil test), el login debe devolver un JWT no vacío.
    @Test @Order(2)
    void login_conCredencialesCorrectas_debeRetornarJwt() {
        Map<String, Object> body = new HashMap<>();
        body.put("email", email);
        body.put("password", "Password1!");

        ResponseEntity<Map> res = http.exchange(
            GATEWAY + "/api/auth/login", HttpMethod.POST, jsonReq(body), Map.class
        );

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).containsKey("token");
        assertThat(res.getBody().get("token").toString()).isNotBlank();

        jwt = res.getBody().get("token").toString();
    }

    // ─── Prueba POST /api/auth/registro con email ya registrado ───────────────
    // Intentar registrar el mismo email dos veces debe devolver 409 CONFLICT.
    @Test @Order(3)
    void registro_conEmailDuplicado_debeRetornar409() {
        Map<String, Object> body = new HashMap<>();
        body.put("nombre", "Duplicado");
        body.put("email", email);
        body.put("password", "Password1!");

        assertThatThrownBy(() ->
            http.exchange(GATEWAY + "/api/auth/registro", HttpMethod.POST, jsonReq(body), Map.class)
        ).isInstanceOf(HttpClientErrorException.Conflict.class);
    }

    // ─── Prueba POST /api/auth/login con contraseña incorrecta ────────────────
    // Credenciales inválidas deben devolver 401 UNAUTHORIZED.
    @Test @Order(4)
    void login_conPasswordIncorrecta_debeRetornar401() {
        Map<String, Object> body = new HashMap<>();
        body.put("email", email);
        body.put("password", "WrongPass1!");

        assertThatThrownBy(() ->
            http.exchange(GATEWAY + "/api/auth/login", HttpMethod.POST, jsonReq(body), Map.class)
        ).isInstanceOf(HttpClientErrorException.Unauthorized.class);
    }

    // ─── Prueba POST /api/auth/registro con datos inválidos ───────────────────
    // Password sin mayúscula ni carácter especial debe devolver 400 BAD REQUEST.
    @Test @Order(5)
    void registro_conPasswordDebil_debeRetornar400() {
        Map<String, Object> body = new HashMap<>();
        body.put("nombre", "Test");
        body.put("email", "otro-" + UUID.randomUUID().toString().substring(0, 6) + "@worki.test");
        body.put("password", "password");

        assertThatThrownBy(() ->
            http.exchange(GATEWAY + "/api/auth/registro", HttpMethod.POST, jsonReq(body), Map.class)
        ).isInstanceOf(HttpClientErrorException.BadRequest.class);
    }

    static HttpEntity<Map<String, Object>> jsonReq(Map<String, Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(body, headers);
    }
}
