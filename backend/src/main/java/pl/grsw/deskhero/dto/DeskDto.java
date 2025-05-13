package pl.grsw.deskhero.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.grsw.deskhero.model.Desk;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeskDto {
    @JsonProperty("deskId")
    private Long id;
    private String roomName;
    private String deskNumber;

    /**
     * Tworzy obiekt DeskDto na podstawie obiektu modelu Desk.
     * @param desk Obiekt modelu Desk.
     * @return Obiekt DeskDto.
     */
    public static DeskDto fromModel(Desk desk) {
        if (desk == null) {
            return null;
        }
        return new DeskDto(
                desk.getId(),
                desk.getRoomName(),
                desk.getDeskNumber()
        );
    }

    // Metoda toModel nie jest tutaj zazwyczaj potrzebna,
    // ponieważ zazwyczaj nie tworzymy/aktualizujemy obiektu Desk za pomocą tego DTO
    // (do tego służy DeskRequestDto). Jeśli będzie potrzebna, można ją dodać.
} 
