package pl.grsw.deskhero.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pl.grsw.deskhero.model.User; // Import encji User

import javax.crypto.SecretKey;
import java.util.Date;

@Component
@RequiredArgsConstructor // Lombok wygeneruje konstruktor wstrzykujący JwtProperties
public class JwtTokenProvider {

    // Wstrzyknij bean z konfiguracją JWT
    private final JwtProperties jwtProperties;

    private SecretKey getSigningKey() {
        // Użyj sekretu z obiektu jwtProperties
        return Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes());
    }

    public String generateToken(User user) {
        Date now = new Date();
        // Użyj czasu wygaśnięcia z obiektu jwtProperties
        Date expiryDate = new Date(now.getTime() + jwtProperties.getExpirationMs());

        return Jwts.builder()
                .setSubject(user.getUsername())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    // Można tu dodać metody do walidacji tokenu i ekstrakcji nazwy użytkownika,
    // ale na razie skupiamy się na generowaniu.
} 
