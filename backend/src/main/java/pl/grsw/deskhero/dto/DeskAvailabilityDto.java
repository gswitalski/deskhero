package pl.grsw.deskhero.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import pl.grsw.deskhero.model.Desk;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true) // Ważne przy dziedziczeniu z @Data
public class DeskAvailabilityDto extends DeskDto {

    private Boolean isAvailable;

    // Konstruktor przyjmujący wszystkie pola z nadklasy i bieżącej klasy
    public DeskAvailabilityDto(Long id, String roomName, String deskNumber, Boolean isAvailable) {
        super(id, roomName, deskNumber);
        this.isAvailable = isAvailable;
    }

    /**
     * Tworzy obiekt DeskAvailabilityDto na podstawie obiektu modelu Desk i informacji o dostępności.
     * @param desk Obiekt modelu Desk.
     * @param isAvailable Informacja o dostępności biurka.
     * @return Obiekt DeskAvailabilityDto.
     */
    public static DeskAvailabilityDto fromModel(Desk desk, Boolean isAvailable) {
        if (desk == null) {
            return null;
        }
        return new DeskAvailabilityDto(
                desk.getId(),
                desk.getRoomName(),
                desk.getDeskNumber(),
                isAvailable
        );
    }
} 
