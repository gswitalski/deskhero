package pl.grsw.deskhero.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;
import java.util.List;
import pl.grsw.deskhero.dto.ReservationDto;
import pl.grsw.deskhero.dto.ReservationRequestDto;
import pl.grsw.deskhero.exception.ResourceNotFoundException;
import pl.grsw.deskhero.service.ReservationService;
import pl.grsw.deskhero.service.UserService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import pl.grsw.deskhero.dto.DeleteReservationResponseDto;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@Slf4j
public class ReservationController {

    private final ReservationService reservationService;
    private final UserService userService;

    /**
     * Tworzy nową rezerwację biurka.
     * 
     * @param requestDto dane rezerwacji
     * @return utworzona rezerwacja z kodem HTTP 201 (Created)
     */
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ReservationDto> createReservation(
            @Valid @RequestBody ReservationRequestDto requestDto) {
        
        // Pobranie danych uwierzytelniającego z kontekstu bezpieczeństwa
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResourceNotFoundException("Użytkownik", "authentication", "not found");
        }
        
        String username = authentication.getName();
        // Pobranie ID zalogowanego użytkownika
        Long userId = userService.getUserIdByUsername(username);
        log.debug("Tworzenie rezerwacji dla użytkownika: {}, biurko: {}, data: {}", 
                userId, requestDto.getDeskId(), requestDto.getReservationDate());
        
        // Delegacja do serwisu biznesowego
        ReservationDto createdReservation = reservationService.createReservation(
                userId, 
                requestDto.getDeskId(), 
                requestDto.getReservationDate()
        );
        
        // Zwrócenie odpowiedzi z kodem 201 Created
        return ResponseEntity.status(HttpStatus.CREATED).body(createdReservation);
    }

    /**
     * Zwraca listę rezerwacji zalogowanego użytkownika z opcjonalnym filtrowaniem po przedziale dat.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReservationDto>> getReservations(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Long userId = userService.getUserIdByUsername(username);

        List<ReservationDto> reservations = reservationService.getReservationsForUser(userId, startDate, endDate);
        return ResponseEntity.ok(reservations);
    }

    /**
     * Usuwa rezerwację biurka o podanym ID.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DeleteReservationResponseDto> deleteReservation(
            @PathVariable("id") Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        DeleteReservationResponseDto response = reservationService.deleteReservation(id, username);
        return ResponseEntity.ok(response);
    }
} 
