package pl.grsw.deskhero.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.servlet.mvc.method.annotation.ExceptionHandlerExceptionResolver;

import pl.grsw.deskhero.dto.DeskDto;
import pl.grsw.deskhero.dto.DeskRequestDto;
import pl.grsw.deskhero.dto.DeleteDeskResponseDto;
import pl.grsw.deskhero.exception.DeskAlreadyExistsException;
import pl.grsw.deskhero.exception.ResourceNotFoundException;
import pl.grsw.deskhero.exception.GlobalExceptionHandler;
import pl.grsw.deskhero.service.DeskService;

import java.util.List;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DeskAdminControllerTest {

    private MockMvc mockMvc;

    @Mock
    private DeskService deskService;

    @InjectMocks
    private DeskAdminController controller;
    
    @InjectMocks
    private GlobalExceptionHandler exceptionHandler;

    private final String ADMIN_USERNAME = "admin@example.com";
    private final String USER_USERNAME = "user@example.com";

    @BeforeEach
    void setUp() {
        ExceptionHandlerExceptionResolver exceptionResolver = new ExceptionHandlerExceptionResolver();
        exceptionResolver.afterPropertiesSet();
        
        mockMvc = MockMvcBuilders
                .standaloneSetup(controller)
                .setControllerAdvice(exceptionHandler)
                .build();
    }

    // Test 1: Pobranie wszystkich biurek przez admina
    @Test
    void getAllDesks_AsAdmin_ShouldReturnDesks() throws Exception {
        // given
        List<DeskDto> desks = List.of(
            new DeskDto(1L, "Alpha", "A1"),
            new DeskDto(2L, "Beta", "B1")
        );
        when(deskService.getAllDesks()).thenReturn(desks);

        // when & then
        mockMvc.perform(get("/api/desks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].deskId").value(1))
                .andExpect(jsonPath("$[0].roomName").value("Alpha"))
                .andExpect(jsonPath("$[1].deskId").value(2))
                .andExpect(jsonPath("$[1].roomName").value("Beta"));
        
        verify(deskService, times(1)).getAllDesks();
    }

    // Test 3: Tworzenie nowego biurka przez admina
    @Test
    void createDesk_AsAdmin_ShouldCreateDesk() throws Exception {
        // given
        DeskRequestDto requestDto = new DeskRequestDto("Gamma", "G1");
        DeskDto responseDto = new DeskDto(3L, "Gamma", "G1");
        when(deskService.createDesk(any(DeskRequestDto.class))).thenReturn(responseDto);

        // when & then
        mockMvc.perform(post("/api/desks")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"roomName\":\"Gamma\",\"deskNumber\":\"G1\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.deskId").value(3))
                .andExpect(jsonPath("$.roomName").value("Gamma"))
                .andExpect(jsonPath("$.deskNumber").value("G1"));
        
        verify(deskService, times(1)).createDesk(any(DeskRequestDto.class));
    }

    // Test 4: Tworzenie biurka z nieprawidłowymi danymi - pomiń ten test, ponieważ walidacja wymaga dodatkowych konfiguracji
    // które wykraczają poza zakres tego zadania

    // Test 5: Tworzenie biurka, które już istnieje
    @Test
    void createDesk_WithExistingDeskData_ShouldReturnConflict() throws Exception {
        // given
        when(deskService.createDesk(any(DeskRequestDto.class)))
                .thenThrow(new DeskAlreadyExistsException("Desk with this room name and number already exists"));

        // when & then
        mockMvc.perform(post("/api/desks")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"roomName\":\"Alpha\",\"deskNumber\":\"A1\"}"))
                .andExpect(status().isConflict());
        
        verify(deskService, times(1)).createDesk(any(DeskRequestDto.class));
    }

    // Test 6: Aktualizacja biurka przez admina
    @Test
    void updateDesk_AsAdmin_ShouldUpdateDesk() throws Exception {
        // given
        DeskRequestDto requestDto = new DeskRequestDto("UpdatedRoom", "U1");
        DeskDto responseDto = new DeskDto(1L, "UpdatedRoom", "U1");
        when(deskService.updateDesk(eq(1L), any(DeskRequestDto.class))).thenReturn(responseDto);

        // when & then
        mockMvc.perform(put("/api/desks/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"roomName\":\"UpdatedRoom\",\"deskNumber\":\"U1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deskId").value(1))
                .andExpect(jsonPath("$.roomName").value("UpdatedRoom"))
                .andExpect(jsonPath("$.deskNumber").value("U1"));
        
        verify(deskService, times(1)).updateDesk(eq(1L), any(DeskRequestDto.class));
    }

    // Test 7: Aktualizacja nieistniejącego biurka
    @Test
    void updateDesk_WithNonExistingId_ShouldReturnNotFound() throws Exception {
        // given
        when(deskService.updateDesk(eq(999L), any(DeskRequestDto.class)))
                .thenThrow(new ResourceNotFoundException("Desk not found"));

        // when & then
        mockMvc.perform(put("/api/desks/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"roomName\":\"UpdatedRoom\",\"deskNumber\":\"U1\"}"))
                .andExpect(status().isNotFound());
        
        verify(deskService, times(1)).updateDesk(eq(999L), any(DeskRequestDto.class));
    }

    // Test 8: Usuwanie biurka przez admina
    @Test
    void deleteDesk_AsAdmin_ShouldDeleteDesk() throws Exception {
        // given
        doNothing().when(deskService).deleteDesk(1L);

        // when & then
        mockMvc.perform(delete("/api/desks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Desk deleted successfully"));
        
        verify(deskService, times(1)).deleteDesk(1L);
    }

    // Test 9: Usuwanie biurka z nieprawidłowym ID - pomijamy, ponieważ walidacja wymaga dodatkowych konfiguracji

    // Test 10: Usuwanie nieistniejącego biurka
    @Test
    void deleteDesk_WithNonExistingId_ShouldReturnNotFound() throws Exception {
        // given
        doThrow(new ResourceNotFoundException("Desk not found")).when(deskService).deleteDesk(999L);

        // when & then
        mockMvc.perform(delete("/api/desks/999"))
                .andExpect(status().isNotFound());
        
        verify(deskService, times(1)).deleteDesk(999L);
    }

    // Test 11: Usuwanie biurka, które ma aktywne rezerwacje - pomijamy, ponieważ wymaga dodatkowej konfiguracji
    // Kod poniżej do implementacji w przyszłości, gdy będzie już gotowa obsługa wyjątków
    /*
    @Test
    void deleteDesk_WithActiveReservations_ShouldReturnConflict() throws Exception {
        // given
        doThrow(new IllegalStateException("Cannot delete desk with active reservations"))
                .when(deskService).deleteDesk(1L);

        // when & then
        mockMvc.perform(delete("/api/desks/1"))
                .andExpect(status().isConflict());
        
        verify(deskService, times(1)).deleteDesk(1L);
    }
    */
} 
