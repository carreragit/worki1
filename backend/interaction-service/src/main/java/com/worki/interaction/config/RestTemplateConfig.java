package com.worki.interaction.config;

// Bean de RestTemplate para realizar llamadas HTTP hacia otros microservicios.
// La comunicación inter-servicios va directamente por puerto, sin pasar por el gateway,
// ya que el gateway es exclusivo para tráfico externo (clientes → servicios).

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
