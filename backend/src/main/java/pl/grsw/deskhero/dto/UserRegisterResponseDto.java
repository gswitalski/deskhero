package pl.grsw.deskhero.dto;

public record UserRegisterResponseDto(
        String message,
        UserDto user,
        String token
) {} 
