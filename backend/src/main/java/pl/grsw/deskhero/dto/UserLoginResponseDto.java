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
    private String name;
    
    public UserLoginResponseDto(String token) {
        this(token, 86400, null); // 24 godziny w sekundach
    }
    
    public UserLoginResponseDto(String token, int expiresIn) {
        this(token, expiresIn, null);
    }
} 
