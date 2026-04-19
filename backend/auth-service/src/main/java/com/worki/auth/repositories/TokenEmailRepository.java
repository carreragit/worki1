package com.worki.auth.repositories;

import com.worki.auth.models.TokenEmail;
import com.worki.auth.models.enums.TipoToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenEmailRepository extends JpaRepository<TokenEmail, Long> {

    Optional<TokenEmail> findByTokenAndTipo(String token, TipoToken tipo);
}
