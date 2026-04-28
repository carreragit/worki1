package com.worki.auth.services;

import com.worki.auth.config.JwtService;
import com.worki.auth.dto.request.LoginRequest;
import com.worki.auth.dto.request.RecuperarPasswordRequest;
import com.worki.auth.dto.request.RegistroRequest;
import com.worki.auth.dto.request.ResetPasswordRequest;
import com.worki.auth.dto.response.AuthResponse;
import com.worki.auth.dto.response.UsuarioResponse;
import com.worki.auth.exception.CredencialesInvalidasException;
import com.worki.auth.exception.EmailNoVerificadoException;
import com.worki.auth.exception.EmailYaRegistradoException;
import com.worki.auth.exception.TokenInvalidoException;
import com.worki.auth.exception.UsuarioNoEncontradoException;
import com.worki.auth.models.Referido;
import com.worki.auth.models.TokenEmail;
import com.worki.auth.models.Usuario;
import com.worki.auth.models.enums.TipoToken;
import com.worki.auth.repositories.ReferidoRepository;
import com.worki.auth.repositories.TokenEmailRepository;
import com.worki.auth.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private TokenEmailRepository tokenEmailRepository;
    @Autowired private ReferidoRepository referidoRepository;
    @Autowired private JwtService jwtService;
    @Autowired private EmailService emailService;
    @Autowired private PasswordEncoder passwordEncoder;

    // @Transactional: si algo falla en el medio, revierte todos los cambios en la BD
    @Transactional
    public UsuarioResponse registro(RegistroRequest request) {
        // verifica que el email no esté en uso antes de crear nada
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new EmailYaRegistradoException("El email ya está registrado");
        }

        // crea el usuario - password se hashea con BCrypt, nunca se guarda en texto plano
        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        // código único que este usuario puede compartir para referir a otros
        usuario.setCodigoReferidoPropio(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        usuarioRepository.save(usuario);

        // si vino un código de referido, busca al referidor y registra la relación
        if (request.getCodigoReferido() != null && !request.getCodigoReferido().isBlank()) {
            usuarioRepository.findByCodigoReferidoPropio(request.getCodigoReferido())
                .ifPresent(referidor -> {
                    Referido referido = new Referido();
                    referido.setIdReferidor(referidor.getId());
                    referido.setIdReferido(usuario.getId());
                    referidoRepository.save(referido);
                });
        }

        // genera token de verificación de email con 24h de expiración y lo guarda en BD
        TokenEmail tokenVerificacion = new TokenEmail();
        tokenVerificacion.setIdUsuario(usuario.getId());
        tokenVerificacion.setToken(UUID.randomUUID().toString());
        tokenVerificacion.setTipo(TipoToken.VERIFICACION);
        tokenVerificacion.setExpira(LocalDateTime.now().plusHours(24));
        tokenEmailRepository.save(tokenVerificacion);

        // en dev imprime el link en consola - en prod aquí iría el envío real por SMTP
        emailService.enviarVerificacionEmail(usuario.getEmail(), tokenVerificacion.getToken());

        // mapea la entidad al DTO de respuesta - nunca devuelve el password
        return mapearUsuarioResponse(usuario);
    }

    // login no es @Transactional porque solo lee datos, no modifica nada
    public AuthResponse login(LoginRequest request) {
        // mensaje genérico en ambos casos para no revelar si el email existe o no
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new CredencialesInvalidasException("Credenciales inválidas"));

        // passwordEncoder.matches compara el texto plano con el hash guardado en BD
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new CredencialesInvalidasException("Credenciales inválidas");
        }

        // no puede iniciar sesión hasta confirmar su email
        if (!usuario.isEmailVerificado()) {
            throw new EmailNoVerificadoException("Debes verificar tu email antes de iniciar sesión");
        }

        // genera el JWT con id, email y rol del usuario - válido por 24h
        return new AuthResponse(jwtService.generarToken(usuario));
    }

    @Transactional
    public void verificarEmail(String token) {
        // busca el token en BD filtrando por tipo VERIFICACION para no confundirlo con RECUPERACION
        TokenEmail tokenEmail = tokenEmailRepository.findByTokenAndTipo(token, TipoToken.VERIFICACION)
            .orElseThrow(() -> new TokenInvalidoException("Token de verificación inválido"));

        // valida que no haya sido usado antes y que no haya expirado
        if (tokenEmail.isUsado() || tokenEmail.getExpira().isBefore(LocalDateTime.now())) {
            throw new TokenInvalidoException("El token ha expirado o ya fue utilizado");
        }

        Usuario usuario = usuarioRepository.findById(tokenEmail.getIdUsuario())
            .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario no encontrado"));

        // marca el email como verificado y el token como usado para que no pueda reutilizarse
        usuario.setEmailVerificado(true);
        tokenEmail.setUsado(true);

        usuarioRepository.save(usuario);
        tokenEmailRepository.save(tokenEmail);
    }

    @Transactional
    public void recuperarPassword(RecuperarPasswordRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new UsuarioNoEncontradoException("No existe una cuenta con ese email"));

        // token de recuperación con solo 1h de expiración por seguridad
        TokenEmail tokenRecuperacion = new TokenEmail();
        tokenRecuperacion.setIdUsuario(usuario.getId());
        tokenRecuperacion.setToken(UUID.randomUUID().toString());
        tokenRecuperacion.setTipo(TipoToken.RECUPERACION);
        tokenRecuperacion.setExpira(LocalDateTime.now().plusHours(1));
        tokenEmailRepository.save(tokenRecuperacion);

        // en dev imprime el link en consola - en prod aquí iría el envío real por SMTP
        emailService.enviarRecuperacionPassword(usuario.getEmail(), tokenRecuperacion.getToken());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // busca el token filtrando por tipo RECUPERACION para no confundirlo con VERIFICACION
        TokenEmail tokenEmail = tokenEmailRepository.findByTokenAndTipo(request.getToken(), TipoToken.RECUPERACION)
            .orElseThrow(() -> new TokenInvalidoException("Token de recuperación inválido"));

        // valida que no haya sido usado antes y que no haya expirado
        if (tokenEmail.isUsado() || tokenEmail.getExpira().isBefore(LocalDateTime.now())) {
            throw new TokenInvalidoException("El token ha expirado o ya fue utilizado");
        }

        Usuario usuario = usuarioRepository.findById(tokenEmail.getIdUsuario())
            .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario no encontrado"));

        // hashea la nueva password antes de guardar
        usuario.setPassword(passwordEncoder.encode(request.getNuevaPassword()));
        // marca el token como usado para que el link del correo no pueda reutilizarse
        tokenEmail.setUsado(true);

        usuarioRepository.save(usuario);
        tokenEmailRepository.save(tokenEmail);
    }

    // mapeo de entidad Usuario hacia UsuarioResponse - sin exponer password ni campos internos
    private UsuarioResponse mapearUsuarioResponse(Usuario usuario) {
        return new UsuarioResponse(
            usuario.getId(),
            usuario.getEmail(),
            usuario.getRol(),
            usuario.isEmailVerificado()
        );
    }
}
