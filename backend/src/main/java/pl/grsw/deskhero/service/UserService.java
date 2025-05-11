package pl.grsw.deskhero.service;

import pl.grsw.deskhero.dto.UserLoginRequestDto;
import pl.grsw.deskhero.dto.UserLoginResponseDto;
import pl.grsw.deskhero.dto.UserRegisterRequestDto;
import pl.grsw.deskhero.dto.UserRegisterResponseDto;

public interface UserService {
    UserRegisterResponseDto registerUser(UserRegisterRequestDto requestDto);
    UserLoginResponseDto authenticate(UserLoginRequestDto requestDto);
    
    /**
     * Pobiera ID użytkownika na podstawie jego nazwy użytkownika (email).
     *
     * @param username nazwa użytkownika (email)
     * @return ID użytkownika
     * @throws pl.grsw.deskhero.exception.ResourceNotFoundException jeśli użytkownik nie zostanie znaleziony
     */
    Long getUserIdByUsername(String username);
} 
