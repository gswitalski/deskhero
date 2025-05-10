package pl.grsw.deskhero.dto;

public record UserRegisterResponseDto(
        String token,
        int expiresIn
) {
    public UserRegisterResponseDto(String token) {
        this(token, 86400); // 24 godziny w sekundach
    }
} 
