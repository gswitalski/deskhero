package pl.grsw.deskhero.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserLoginRequestDto {

    @NotBlank(message = "Nazwa użytkownika (email) nie może być pusta")
    @Email(message = "Niepoprawny format adresu email")
    @Size(max = 50, message = "Email nie może przekraczać 50 znaków")
    private String username;

    @NotBlank(message = "Hasło nie może być puste")
    @Size(min = 8, max = 255, message = "Hasło musi mieć między 8 a 255 znaków")
    private String password;
} 
