package pl.grsw.deskhero.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import pl.grsw.deskhero.dto.DeleteReservationResponseDto;
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
import java.util.*;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private DeskRepository deskRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private ReservationService reservationService;

    private User testUser;
    private Desk testDesk;
    private Reservation testReservation;
    private LocalDate testDate;

    @BeforeEach
    public void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser@example.com");

        testDesk = new Desk();
        testDesk.setId(1L);
        testDesk.setRoomName("TestRoom");
        testDesk.setDeskNumber("T1");

        testDate = LocalDate.now().plusDays(1);

        testReservation = new Reservation();
        testReservation.setId(1L);
        testReservation.setUser(testUser);
        testReservation.setDesk(testDesk);
        testReservation.setReservationDate(testDate);
    }

    @AfterEach
    public void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // Testy dla createReservation

    @Test
    public void createReservation_shouldCreateReservationSuccessfully() {
        // Arrange
        when(deskRepository.findById(testDesk.getId())).thenReturn(Optional.of(testDesk));
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(reservationRepository.existsByDeskIdAndReservationDate(testDesk.getId(), testDate)).thenReturn(false);
        when(reservationRepository.save(any(Reservation.class))).thenReturn(testReservation);

        // Act
        ReservationDto result = reservationService.createReservation(testUser.getId(), testDesk.getId(), testDate);

        // Assert
        assertNotNull(result);
        assertEquals(testReservation.getId(), result.getReservationId());
        assertEquals(testUser.getId(), result.getUserId());
        assertEquals(testDesk.getId(), result.getDeskId());
        assertEquals(testDate, result.getReservationDate());
        verify(reservationRepository).save(any(Reservation.class));
    }

    @Test
    public void createReservation_whenDeskNotFound_shouldThrowResourceNotFoundException() {
        // Arrange
        when(deskRepository.findById(testDesk.getId())).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () ->
                reservationService.createReservation(testUser.getId(), testDesk.getId(), testDate));
        
        assertTrue(exception.getMessage().contains("Biurko"));
        verify(reservationRepository, never()).save(any());
    }

    @Test
    public void createReservation_whenUserNotFound_shouldThrowResourceNotFoundException() {
        // Arrange
        when(deskRepository.findById(testDesk.getId())).thenReturn(Optional.of(testDesk));
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () ->
                reservationService.createReservation(testUser.getId(), testDesk.getId(), testDate));
        
        assertTrue(exception.getMessage().contains("Użytkownik"));
        verify(reservationRepository, never()).save(any());
    }

    @Test
    public void createReservation_whenDeskAlreadyReserved_shouldThrowReservationConflictException() {
        // Arrange
        when(deskRepository.findById(testDesk.getId())).thenReturn(Optional.of(testDesk));
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(reservationRepository.existsByDeskIdAndReservationDate(testDesk.getId(), testDate)).thenReturn(true);

        // Act & Assert
        ReservationConflictException exception = assertThrows(ReservationConflictException.class, () ->
                reservationService.createReservation(testUser.getId(), testDesk.getId(), testDate));
        
        verify(reservationRepository, never()).save(any());
    }

    // Testy dla getReservationsForUser

    @Test
    public void getReservationsForUser_withoutDateFilters_shouldReturnAllReservations() {
        // Arrange
        List<Reservation> reservations = Collections.singletonList(testReservation);
        when(reservationRepository.findByUserId(testUser.getId())).thenReturn(reservations);

        // Act
        List<ReservationDto> result = reservationService.getReservationsForUser(testUser.getId(), null, null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testReservation.getId(), result.get(0).getReservationId());
        verify(reservationRepository).findByUserId(testUser.getId());
        verify(reservationRepository, never()).findByUserIdAndReservationDateBetween(any(), any(), any());
    }

    @Test
    public void getReservationsForUser_withDateFilters_shouldReturnFilteredReservations() {
        // Arrange
        List<Reservation> reservations = Collections.singletonList(testReservation);
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(7);
        
        when(reservationRepository.findByUserIdAndReservationDateBetween(
                testUser.getId(), startDate, endDate)).thenReturn(reservations);

        // Act
        List<ReservationDto> result = reservationService.getReservationsForUser(testUser.getId(), startDate, endDate);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testReservation.getId(), result.get(0).getReservationId());
        verify(reservationRepository).findByUserIdAndReservationDateBetween(testUser.getId(), startDate, endDate);
        verify(reservationRepository, never()).findByUserId(any());
    }

    @Test
    public void getReservationsForUser_withInvalidDateRange_shouldThrowIllegalArgumentException() {
        // Arrange
        LocalDate startDate = LocalDate.now().plusDays(5);
        LocalDate endDate = LocalDate.now();  // endDate before startDate

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                reservationService.getReservationsForUser(testUser.getId(), startDate, endDate));
        
        assertTrue(exception.getMessage().contains("startDate must be before or equal to endDate"));
        verify(reservationRepository, never()).findByUserId(any());
        verify(reservationRepository, never()).findByUserIdAndReservationDateBetween(any(), any(), any());
    }

    // Testy dla deleteReservation

    @Test
    public void deleteReservation_asOwner_shouldDeleteSuccessfully() {
        // Arrange
        when(reservationRepository.findById(testReservation.getId())).thenReturn(Optional.of(testReservation));
        
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        
        // Mockujemy zachowanie getAuthorities()
        doReturn(Collections.emptyList()).when(authentication).getAuthorities();

        // Act
        DeleteReservationResponseDto result = reservationService.deleteReservation(
                testReservation.getId(), testUser.getUsername());

        // Assert
        assertNotNull(result);
        assertEquals("Reservation deleted successfully", result.message());
        verify(reservationRepository).delete(testReservation);
    }

    @Test
    public void deleteReservation_asAdmin_shouldDeleteSuccessfully() {
        // Arrange
        User adminUser = new User();
        adminUser.setId(2L);
        adminUser.setUsername("admin@example.com");
        
        when(reservationRepository.findById(testReservation.getId())).thenReturn(Optional.of(testReservation));
        
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        
        // Mockowanie uprawnień administratora
        SimpleGrantedAuthority adminAuthority = new SimpleGrantedAuthority("ROLE_ADMIN");
        doReturn(Collections.singletonList(adminAuthority)).when(authentication).getAuthorities();

        // Act
        DeleteReservationResponseDto result = reservationService.deleteReservation(
                testReservation.getId(), adminUser.getUsername());

        // Assert
        assertNotNull(result);
        assertEquals("Reservation deleted successfully", result.message());
        verify(reservationRepository).delete(testReservation);
    }

    @Test
    public void deleteReservation_whenNotFoundReservation_shouldThrowResourceNotFoundException() {
        // Arrange
        when(reservationRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () ->
                reservationService.deleteReservation(99L, testUser.getUsername()));
        
        assertTrue(exception.getMessage().contains("Rezerwacja"));
        verify(reservationRepository, never()).delete(any());
    }

    @Test
    public void deleteReservation_whenNotOwnerOrAdmin_shouldThrowAccessDeniedException() {
        // Arrange
        User otherUser = new User();
        otherUser.setId(3L);
        otherUser.setUsername("other@example.com");
        
        when(reservationRepository.findById(testReservation.getId())).thenReturn(Optional.of(testReservation));
        
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        doReturn(Collections.emptyList()).when(authentication).getAuthorities();

        // Act & Assert
        AccessDeniedException exception = assertThrows(AccessDeniedException.class, () ->
                reservationService.deleteReservation(testReservation.getId(), otherUser.getUsername()));
        
        assertTrue(exception.getMessage().contains("Brak uprawnień"));
        verify(reservationRepository, never()).delete(any());
    }

    @Test
    public void deleteReservation_withInvalidId_shouldThrowIllegalArgumentException() {
        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                reservationService.deleteReservation(0L, testUser.getUsername()));
        
        assertTrue(exception.getMessage().contains("Nieprawidłowe ID rezerwacji"));
        
        exception = assertThrows(IllegalArgumentException.class, () ->
                reservationService.deleteReservation(null, testUser.getUsername()));
        
        assertTrue(exception.getMessage().contains("Nieprawidłowe ID rezerwacji"));
        
        verify(reservationRepository, never()).delete(any());
    }
} 
