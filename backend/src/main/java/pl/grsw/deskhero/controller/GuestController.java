package pl.grsw.deskhero.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pl.grsw.deskhero.dto.DeskAvailabilityDto;
import pl.grsw.deskhero.dto.ErrorDto;
import pl.grsw.deskhero.service.DeskService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/guest/desks")
@RequiredArgsConstructor
public class GuestController {

    private static final Logger log = LoggerFactory.getLogger(GuestController.class);
    private final DeskService deskService;

    @GetMapping("/availability")
    public ResponseEntity<?> getDesksAvailability(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            log.info("Fetching desk availability for date: {}", date);
            List<DeskAvailabilityDto> availability = deskService.getDesksAvailability(date);
            return ResponseEntity.ok(availability);
        } catch (Exception e) {
            log.error("Error fetching desk availability for date {}: {}", date, e.getMessage(), e);
            ErrorDto errorDto = new ErrorDto(LocalDateTime.now(), HttpStatus.INTERNAL_SERVER_ERROR.value(), 
                                             "An unexpected error occurred while fetching desk availability.", 
                                             e.getMessage(), "/api/guest/desks/availability");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorDto);
        }
    }
} 
