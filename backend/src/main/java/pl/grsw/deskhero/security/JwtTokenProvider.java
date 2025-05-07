package pl.grsw.deskhero.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
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

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (SignatureException e) {
            // Nieprawidłowy podpis JWT
            return false;
        } catch (MalformedJwtException e) {
            // Nieprawidłowy format JWT
            return false;
        } catch (ExpiredJwtException e) {
            // Token JWT wygasł
            return false;
        } catch (UnsupportedJwtException e) {
            // Token JWT nie jest obsługiwany
            return false;
        } catch (IllegalArgumentException e) {
            // Pusty lub nieprawidłowy string JWT
            return false;
        }
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }
} 
