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

import java.time.LocalDate;

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
} 
