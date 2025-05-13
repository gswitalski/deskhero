package pl.grsw.deskhero.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.time.LocalDateTime;
import pl.grsw.deskhero.dto.DeskDto;
import pl.grsw.deskhero.dto.ErrorDto;
import pl.grsw.deskhero.service.DeskService;
import pl.grsw.deskhero.dto.DeskRequestDto;
import pl.grsw.deskhero.exception.DeskAlreadyExistsException;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import jakarta.validation.constraints.Positive;
import pl.grsw.deskhero.dto.DeleteDeskResponseDto;
import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/desks")
@RequiredArgsConstructor
@Slf4j
@Validated
public class DeskAdminController {

    private final DeskService deskService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DeskDto>> getAllDesks() {
        List<DeskDto> desks = deskService.getAllDesks();
        return ResponseEntity.ok(desks);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DeskDto> createDesk(@Valid @RequestBody DeskRequestDto deskRequestDto) {
        DeskDto created = deskService.createDesk(deskRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DeskDto> updateDesk(@PathVariable Long id, @Valid @RequestBody DeskRequestDto deskRequestDto) {
        DeskDto updated = deskService.updateDesk(id, deskRequestDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DeleteDeskResponseDto> deleteDesk(@PathVariable @Positive Long id) {
        deskService.deleteDesk(id);
        return ResponseEntity.ok(new DeleteDeskResponseDto("Desk deleted successfully"));
    }
} 
