package pl.grsw.deskhero.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.grsw.deskhero.model.Reservation;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

/**
 * Repozytorium Spring Data JPA dla encji {@link Reservation}.
 */
@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    /**
     * Sprawdza, czy istnieje rezerwacja dla danego biurka w określonym dniu.
     *
     * @param deskId ID biurka.
     * @param reservationDate Data rezerwacji.
     * @return true, jeśli rezerwacja istnieje, false w przeciwnym razie.
     */
    boolean existsByDeskIdAndReservationDate(Long deskId, LocalDate reservationDate);

    /**
     * Znajduje wszystkie rezerwacje dla danego użytkownika.
     *
     * @param userId ID użytkownika.
     * @return Lista rezerwacji użytkownika.
     */
    List<Reservation> findByUserId(Long userId);

    /**
     * Znajduje wszystkie rezerwacje dla danego użytkownika o określonym statusie.
     *
     * @param userId ID użytkownika.
     * @param status Status rezerwacji (np. "active", "cancelled").
     * @return Lista rezerwacji użytkownika o podanym statusie.
     */
    List<Reservation> findByUserIdAndStatus(Long userId, String status);

    /**
     * Znajduje wszystkie rezerwacje dla danego użytkownika w podanym zakresie dat.
     *
     * @param userId ID użytkownika.
     * @param startDate Data początkowa zakresu.
     * @param endDate Data końcowa zakresu.
     * @return Lista rezerwacji użytkownika w podanym zakresie dat.
     */
    List<Reservation> findByUserIdAndReservationDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    /**
     * Znajduje wszystkie rezerwacje dla danego użytkownika o określonym statusie i w podanym zakresie dat.
     *
     * @param userId ID użytkownika.
     * @param status Status rezerwacji.
     * @param startDate Data początkowa zakresu.
     * @param endDate Data końcowa zakresu.
     * @return Lista rezerwacji użytkownika spełniających kryteria.
     */
    List<Reservation> findByUserIdAndStatusAndReservationDateBetween(Long userId, String status, LocalDate startDate, LocalDate endDate);

    /**
     * Znajduje rezerwacje dla listy biurek w określonym dniu.
     * Może być przydatne do sprawdzania dostępności wielu biurek naraz.
     *
     * @param deskIds Kolekcja ID biurek.
     * @param date Data rezerwacji.
     * @return Lista rezerwacji dla podanych biurek w danym dniu.
     */
    List<Reservation> findByDeskIdInAndReservationDate(Collection<Long> deskIds, LocalDate date);
} 
