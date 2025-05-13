package pl.grsw.deskhero.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.time.LocalDateTime;
import pl.grsw.deskhero.dto.DeskDto;
import pl.grsw.deskhero.dto.ErrorDto;
import pl.grsw.deskhero.service.DeskService;

@RestController
@RequestMapping("/api/desks")
@RequiredArgsConstructor
@Slf4j
public class DeskAdminController {

    private final DeskService deskService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllDesks() {
        try {
            List<DeskDto> desks = deskService.getAllDesks();
            return ResponseEntity.ok(desks);
        } catch (Exception e) {
            log.error("Failed to fetch desks: {}", e.getMessage(), e);
            ErrorDto error = new ErrorDto(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Unexpected server error while fetching desks.",
                e.getMessage(),
                "/api/desks"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
} 
