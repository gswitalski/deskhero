package pl.grsw.deskhero.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.time.LocalDate;

/**
 * Wyjątek rzucany, gdy występuje konflikt rezerwacji (np. biurko jest już zarezerwowane na daną datę).
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class ReservationConflictException extends RuntimeException {

    public ReservationConflictException(String message) {
        super(message);
    }

    public ReservationConflictException(Long deskId, LocalDate date) {
        super(String.format("Biurko o ID %d jest już zarezerwowane na dzień %s", deskId, date));
    }
} 
