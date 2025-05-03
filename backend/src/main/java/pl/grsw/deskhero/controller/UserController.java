package pl.grsw.deskhero.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.grsw.deskhero.dto.UserRegisterRequestDto;
import pl.grsw.deskhero.dto.UserRegisterResponseDto;
import pl.grsw.deskhero.service.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserRegisterResponseDto> registerUser(@Valid @RequestBody UserRegisterRequestDto requestDto) {
        UserRegisterResponseDto responseDto = userService.registerUser(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    // Tutaj można dodać inne endpointy związane z użytkownikami (np. logowanie)
} 
