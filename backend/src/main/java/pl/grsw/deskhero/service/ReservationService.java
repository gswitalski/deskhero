package pl.grsw.deskhero.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.grsw.deskhero.dto.ReservationDto;
import pl.grsw.deskhero.exception.ReservationConflictException;
import pl.grsw.deskhero.exception.ResourceNotFoundException;
import pl.grsw.deskhero.model.Desk;
import pl.grsw.deskhero.model.Reservation;
import pl.grsw.deskhero.model.User;
import pl.grsw.deskhero.repository.DeskRepository;
import pl.grsw.deskhero.repository.ReservationRepository;
import pl.grsw.deskhero.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import pl.grsw.deskhero.dto.DeleteReservationResponseDto;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final DeskRepository deskRepository;
    private final UserRepository userRepository;

    /**
     * Tworzy nową rezerwację biurka.
     *
     * @param userId ID użytkownika tworzącego rezerwację
     * @param deskId ID biurka do zarezerwowania
     * @param reservationDate Data rezerwacji
     * @return DTO utworzonej rezerwacji
     * @throws ResourceNotFoundException jeśli biurko lub użytkownik nie istnieje
     * @throws ReservationConflictException jeśli biurko jest już zarezerwowane na podaną datę
     */
    @Transactional
    public ReservationDto createReservation(Long userId, Long deskId, LocalDate reservationDate) {
        // Sprawdzenie, czy biurko istnieje
        Desk desk = deskRepository.findById(deskId)
                .orElseThrow(() -> new ResourceNotFoundException("Biurko", "id", deskId));

        // Sprawdzenie, czy użytkownik istnieje
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Użytkownik", "id", userId));

        // Sprawdzenie, czy biurko jest już zarezerwowane na ten dzień
        if (reservationRepository.existsByDeskIdAndReservationDate(deskId, reservationDate)) {
            throw new ReservationConflictException(deskId, reservationDate);
        }

        // Utworzenie i zapisanie nowej rezerwacji
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setDesk(desk);
        reservation.setReservationDate(reservationDate);

        Reservation savedReservation = reservationRepository.save(reservation);
        log.info("Utworzono rezerwację: ID={}, użytkownik={}, biurko={}, data={}", 
                savedReservation.getId(), userId, deskId, reservationDate);

        return ReservationDto.fromModel(savedReservation);
    }

    /**
     * Pobiera listę rezerwacji użytkownika z opcjonalnym filtrowaniem po przedziale dat.
     *
     * @param userId    ID użytkownika
     * @param startDate data początkowa zakresu (nullable)
     * @param endDate   data końcowa zakresu (nullable)
     * @return lista DTO rezerwacji
     * @throws IllegalArgumentException jeśli startDate > endDate
     */
    @Transactional(readOnly = true)
    public List<ReservationDto> getReservationsForUser(Long userId, LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("startDate must be before or equal to endDate");
        }
        List<Reservation> reservations;
        if (startDate != null && endDate != null) {
            reservations = reservationRepository.findByUserIdAndReservationDateBetween(userId, startDate, endDate);
        } else {
            reservations = reservationRepository.findByUserId(userId);
        }
        return reservations.stream()
                .map(ReservationDto::fromModel)
                .collect(Collectors.toList());
    }

    /**
     * Usuwa istniejącą rezerwację o podanym ID, jeśli użytkownik jest właścicielem lub ma rolę ADMIN.
     *
     * @param reservationId ID rezerwacji do usunięcia
     * @param username nazwa użytkownika wykonującego operację
     * @return DTO potwierdzające usunięcie rezerwacji
     */
    @Transactional
    public DeleteReservationResponseDto deleteReservation(Long reservationId, String username) {
        if (reservationId == null || reservationId <= 0) {
            throw new IllegalArgumentException("Nieprawidłowe ID rezerwacji: " + reservationId);
        }
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Rezerwacja", "id", reservationId));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!reservation.getUser().getUsername().equals(username) && !isAdmin) {
            throw new AccessDeniedException("Brak uprawnień do usunięcia tej rezerwacji");
        }

        reservationRepository.delete(reservation);
        log.info("Usunięto rezerwację: ID={}, użytkownik={}", reservationId, username);
        return new DeleteReservationResponseDto("Reservation deleted successfully");
    }
} 
