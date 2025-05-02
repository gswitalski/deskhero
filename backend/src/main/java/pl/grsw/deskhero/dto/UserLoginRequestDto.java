package pl.grsw.deskhero.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserLoginRequestDto {

    @NotBlank(message = "Nazwa użytkownika (email) nie może być pusta")
    @Email(message = "Niepoprawny format adresu email")
    private String username;

    @NotBlank(message = "Hasło nie może być puste")
    private String password;
} 
