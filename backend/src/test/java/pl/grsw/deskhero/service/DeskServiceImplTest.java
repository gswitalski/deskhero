package pl.grsw.deskhero.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.grsw.deskhero.dto.DeskAvailabilityDto;
import pl.grsw.deskhero.dto.DeskDto;
import pl.grsw.deskhero.dto.DeskRequestDto;
import pl.grsw.deskhero.exception.DeskAlreadyExistsException;
import pl.grsw.deskhero.exception.ResourceNotFoundException;
import pl.grsw.deskhero.model.Desk;
import pl.grsw.deskhero.repository.DeskRepository;
import pl.grsw.deskhero.repository.ReservationRepository;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeskServiceImplTest {

    @Mock
    private DeskRepository deskRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private DeskServiceImpl deskService;

    @Test
    void getDesksAvailability_ShouldReturnAllDesksWithAvailabilityStatus() {
        // given
        LocalDate date = LocalDate.now();
        Desk desk1 = new Desk();
        desk1.setId(1L);
        desk1.setRoomName("Alpha");
        desk1.setDeskNumber("A1");
        
        Desk desk2 = new Desk();
        desk2.setId(2L);
        desk2.setRoomName("Beta");
        desk2.setDeskNumber("B1");
        
        List<Desk> allDesks = Arrays.asList(desk1, desk2);
        
        when(deskRepository.findAll()).thenReturn(allDesks);
        when(reservationRepository.existsByDeskIdAndReservationDate(1L, date)).thenReturn(true);
        when(reservationRepository.existsByDeskIdAndReservationDate(2L, date)).thenReturn(false);
        
        // when
        List<DeskAvailabilityDto> result = deskService.getDesksAvailability(date);
        
        // then
        assertThat(result).hasSize(2);
        
        // Biurko 1 powinno być zajęte
        DeskAvailabilityDto desk1Dto = result.stream()
            .filter(dto -> dto.getId().equals(1L))
            .findFirst()
            .orElseThrow();
        assertFalse(desk1Dto.getIsAvailable());
        
        // Biurko 2 powinno być wolne
        DeskAvailabilityDto desk2Dto = result.stream()
            .filter(dto -> dto.getId().equals(2L))
            .findFirst()
            .orElseThrow();
        assertTrue(desk2Dto.getIsAvailable());
    }

    @Test
    void getAllDesks_ShouldReturnAllDesks() {
        // given
        Desk desk1 = new Desk();
        desk1.setId(1L);
        desk1.setRoomName("Alpha");
        desk1.setDeskNumber("A1");
        
        Desk desk2 = new Desk();
        desk2.setId(2L);
        desk2.setRoomName("Beta");
        desk2.setDeskNumber("B1");
        
        List<Desk> desks = Arrays.asList(desk1, desk2);
        when(deskRepository.findAll()).thenReturn(desks);
        
        // when
        List<DeskDto> result = deskService.getAllDesks();
        
        // then
        assertThat(result).hasSize(2);
        verify(deskRepository).findAll();
    }

    @Test
    void createDesk_WithValidData_ShouldCreateAndReturnDesk() {
        // given
        DeskRequestDto requestDto = new DeskRequestDto("Gamma", "G1");
        Desk newDesk = new Desk();
        newDesk.setId(1L);
        newDesk.setRoomName("Gamma");
        newDesk.setDeskNumber("G1");
        
        when(deskRepository.existsByRoomNameAndDeskNumber("Gamma", "G1")).thenReturn(false);
        when(deskRepository.save(any(Desk.class))).thenReturn(newDesk);
        
        // when
        DeskDto result = deskService.createDesk(requestDto);
        
        // then
        assertNotNull(result);
        assertEquals("Gamma", result.getRoomName());
        assertEquals("G1", result.getDeskNumber());
        verify(deskRepository).save(any(Desk.class));
    }
    
    @Test
    void createDesk_WithDuplicateRoomAndDeskNumber_ShouldThrowException() {
        // given
        DeskRequestDto requestDto = new DeskRequestDto("Alpha", "A1");
        when(deskRepository.existsByRoomNameAndDeskNumber("Alpha", "A1")).thenReturn(true);
        
        // when, then
        assertThrows(DeskAlreadyExistsException.class, () -> deskService.createDesk(requestDto));
        verify(deskRepository, never()).save(any(Desk.class));
    }

    @Test
    void updateDesk_WithValidData_ShouldUpdateAndReturnDesk() {
        // given
        Long deskId = 1L;
        DeskRequestDto requestDto = new DeskRequestDto("Updated Room", "U1");
        
        Desk existingDesk = new Desk();
        existingDesk.setId(deskId);
        existingDesk.setRoomName("Alpha");
        existingDesk.setDeskNumber("A1");
        
        Desk updatedDesk = new Desk();
        updatedDesk.setId(deskId);
        updatedDesk.setRoomName("Updated Room");
        updatedDesk.setDeskNumber("U1");
        
        when(deskRepository.findById(deskId)).thenReturn(Optional.of(existingDesk));
        when(deskRepository.existsByRoomNameAndDeskNumberAndIdNot("Updated Room", "U1", deskId))
            .thenReturn(false);
        when(deskRepository.save(any(Desk.class))).thenReturn(updatedDesk);
        
        // when
        DeskDto result = deskService.updateDesk(deskId, requestDto);
        
        // then
        assertNotNull(result);
        assertEquals("Updated Room", result.getRoomName());
        assertEquals("U1", result.getDeskNumber());
        verify(deskRepository).save(any(Desk.class));
    }
    
    @Test
    void updateDesk_WithNonExistingId_ShouldThrowException() {
        // given
        Long deskId = 999L;
        DeskRequestDto requestDto = new DeskRequestDto("Updated Room", "U1");
        
        when(deskRepository.findById(deskId)).thenReturn(Optional.empty());
        
        // when, then
        assertThrows(ResourceNotFoundException.class, () -> deskService.updateDesk(deskId, requestDto));
        verify(deskRepository, never()).save(any(Desk.class));
    }
    
    @Test
    void updateDesk_WithDuplicateRoomAndDeskNumber_ShouldThrowException() {
        // given
        Long deskId = 1L;
        DeskRequestDto requestDto = new DeskRequestDto("Beta", "B1");
        
        Desk existingDesk = new Desk();
        existingDesk.setId(deskId);
        existingDesk.setRoomName("Alpha");
        existingDesk.setDeskNumber("A1");
        
        when(deskRepository.findById(deskId)).thenReturn(Optional.of(existingDesk));
        when(deskRepository.existsByRoomNameAndDeskNumberAndIdNot("Beta", "B1", deskId))
            .thenReturn(true);
        
        // when, then
        assertThrows(DeskAlreadyExistsException.class, () -> deskService.updateDesk(deskId, requestDto));
        verify(deskRepository, never()).save(any(Desk.class));
    }

    @Test
    void deleteDesk_WithExistingId_ShouldDeleteDesk() {
        // given
        Long deskId = 1L;
        Desk existingDesk = new Desk();
        existingDesk.setId(deskId);
        existingDesk.setRoomName("Alpha");
        existingDesk.setDeskNumber("A1");
        
        when(deskRepository.findById(deskId)).thenReturn(Optional.of(existingDesk));
        
        // when
        deskService.deleteDesk(deskId);
        
        // then
        verify(deskRepository).delete(existingDesk);
    }
    
    @Test
    void deleteDesk_WithNonExistingId_ShouldThrowException() {
        // given
        Long deskId = 999L;
        when(deskRepository.findById(deskId)).thenReturn(Optional.empty());
        
        // when, then
        assertThrows(ResourceNotFoundException.class, () -> deskService.deleteDesk(deskId));
        verify(deskRepository, never()).delete(any(Desk.class));
    }
} 
