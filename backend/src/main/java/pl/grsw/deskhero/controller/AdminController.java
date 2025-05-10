package pl.grsw.deskhero.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Kontroler obsługujący funkcje administracyjne.
 * Wszystkie metody są zabezpieczone i dostępne tylko dla użytkowników z rolą ADMIN.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    /**
     * Endpoint testowy do sprawdzenia działania uprawnień administratora.
     * @return Informacja o poprawnym działaniu panelu administracyjnego.
     */
    @GetMapping("/check")
    public ResponseEntity<String> checkAdminAccess() {
        return ResponseEntity.ok("Panel administracyjny działa poprawnie. Masz uprawnienia administratora.");
    }

    /**
     * W tym miejscu można dodawać kolejne endpointy administracyjne, 
     * np. do zarządzania biurkami czy użytkownikami.
     */
} 
