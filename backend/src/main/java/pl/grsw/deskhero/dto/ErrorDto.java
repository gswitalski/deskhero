package pl.grsw.deskhero.dto;

import java.time.LocalDateTime;

/**
 * Standardowy DTO do zwracania informacji o błędach API.
 */
public record ErrorDto(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path
) {
} 
