package com.worki.auth.config;

// Bean de RestTemplate para realizar llamadas HTTP hacia otros microservicios.
// Usado por AuthService para crear el perfil en user-service al momento del registro.

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
