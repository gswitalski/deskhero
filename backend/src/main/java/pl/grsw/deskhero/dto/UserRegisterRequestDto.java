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
public class UserRegisterRequestDto {

    @NotBlank(message = "Nazwa użytkownika (email) nie może być pusta")
    @Email(message = "Niepoprawny format adresu email")
    private String username;

    @NotBlank(message = "Imię i nazwisko nie może być puste")
    private String name;

    @NotBlank(message = "Hasło nie może być puste")
    @Size(min = 8, message = "Hasło musi mieć co najmniej 8 znaków")
    private String password;
} 
