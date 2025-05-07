package pl.grsw.deskhero.exception;

import org.springframework.security.core.AuthenticationException;

/**
 * Wyjątek rzucany w przypadku problemów z uwierzytelnianiem przy użyciu tokenu JWT.
 */
public class JwtAuthenticationException extends AuthenticationException {

    public JwtAuthenticationException(String message) {
        super(message);
    }

    public JwtAuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
} 
