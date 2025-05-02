package pl.grsw.deskhero.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationRequestDto {

    @NotNull(message = "ID biurka nie może być puste")
    private Long deskId;

    @NotNull(message = "Data rezerwacji nie może być pusta")
    @FutureOrPresent(message = "Data rezerwacji nie może być z przeszłości")
    private LocalDate reservationDate;

    // Metoda toModel nie jest tutaj potrzebna, ponieważ do stworzenia modelu Reservation
    // potrzebujemy również informacji o użytkowniku (z kontekstu bezpieczeństwa)
    // oraz statusu, który jest ustawiany domyślnie w logice biznesowej.
} 
