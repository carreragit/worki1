package com.worki.interaction.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

// Configura el broker de mensajes STOMP sobre WebSocket.
// El mobile se conecta a /ws y se suscribe a /topic/chat/{solicitudId}.
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private WebSocketAuthInterceptor authInterceptor;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Punto de entrada WebSocket — el mobile conecta a ws://host:8084/ws
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Los mensajes enviados a /app/... son procesados por @MessageMapping
        registry.setApplicationDestinationPrefixes("/app");
        // Los mensajes enviados a /topic/... son distribuidos a todos los suscriptores
        registry.enableSimpleBroker("/topic");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(authInterceptor);
    }
}
