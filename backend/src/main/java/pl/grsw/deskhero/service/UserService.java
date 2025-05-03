package pl.grsw.deskhero.service;

import pl.grsw.deskhero.dto.UserRegisterRequestDto;
import pl.grsw.deskhero.dto.UserRegisterResponseDto;

public interface UserService {
    UserRegisterResponseDto registerUser(UserRegisterRequestDto requestDto);
} 
