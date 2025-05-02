package pl.grsw.deskhero.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.grsw.deskhero.model.Reservation;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDto {
    private Long reservationId;
    private Long userId; // Zgodnie z planem API, zwracamy ID użytkownika
    private Long deskId;
    private LocalDate reservationDate;
    private String status;

    /**
     * Tworzy obiekt ReservationDto na podstawie obiektu modelu Reservation.
     * @param reservation Obiekt modelu Reservation.
     * @return Obiekt ReservationDto.
     */
    public static ReservationDto fromModel(Reservation reservation) {
        if (reservation == null) {
            return null;
        }
        return new ReservationDto(
                reservation.getId(),
                // Zakładamy, że model Reservation ma pole user z metodą getId()
                reservation.getUser() != null ? reservation.getUser().getId() : null,
                // Zakładamy, że model Reservation ma pole desk z metodą getId()
                reservation.getDesk() != null ? reservation.getDesk().getId() : null,
                reservation.getReservationDate(),
                reservation.getStatus()
        );
    }

    // Metoda toModel nie jest tutaj zazwyczaj potrzebna,
    // ponieważ zazwyczaj nie tworzymy/aktualizujemy obiektu Reservation za pomocą tego DTO
    // (do tego służy ReservationRequestDto i logika biznesowa).
} 
