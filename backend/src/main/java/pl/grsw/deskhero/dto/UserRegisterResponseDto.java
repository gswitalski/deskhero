package pl.grsw.deskhero.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRegisterResponseDto {
    private String message;
    private UserDto user;
    private String token;
} 
