package com.worki.interaction.config;

// Bean de RestTemplate para realizar llamadas HTTP hacia otros microservicios.
// La comunicación inter-servicios va directamente por puerto, sin pasar por el gateway,
// ya que el gateway es exclusivo para tráfico externo (clientes → servicios).

import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        // HttpComponentsClientHttpRequestFactory habilita todos los métodos HTTP incluyendo PATCH
        return new RestTemplate(new HttpComponentsClientHttpRequestFactory(HttpClients.createDefault()));
    }
}
