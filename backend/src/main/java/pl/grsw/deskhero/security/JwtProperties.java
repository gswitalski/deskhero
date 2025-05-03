package pl.grsw.deskhero.security;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.jwt")
@RequiredArgsConstructor // Generuje konstruktor dla finalnych pól
@Getter // Generuje gettery, aby JwtTokenProvider miał dostęp
public class JwtProperties {

    private final String secret;
    private final long expirationMs;

} 
