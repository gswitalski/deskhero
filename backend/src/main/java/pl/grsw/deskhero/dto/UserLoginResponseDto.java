package pl.grsw.deskhero.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserLoginResponseDto {
    private String token;
    private int expiresIn;
    
    public UserLoginResponseDto(String token) {
        this(token, 86400); // 24 godziny w sekundach
    }
} 
