package pl.grsw.deskhero.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.grsw.deskhero.model.User;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String username;
    private String name;

    /**
     * Tworzy obiekt UserDto na podstawie obiektu modelu User.
     * @param user Obiekt modelu User.
     * @return Obiekt UserDto.
     */
    public static UserDto fromModel(User user) {
        if (user == null) {
            return null;
        }
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getName()
        );
    }

    // Metoda toModel nie jest tutaj zazwyczaj potrzebna,
    // ponieważ zazwyczaj nie tworzymy pełnego obiektu User z tego DTO.
    // Jeśli będzie potrzebna, można ją dodać.
} 
