package pl.grsw.deskhero.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.grsw.deskhero.dto.UserDto;
import pl.grsw.deskhero.dto.UserRegisterRequestDto;
import pl.grsw.deskhero.dto.UserRegisterResponseDto;
import pl.grsw.deskhero.exception.UserAlreadyExistsException;
import pl.grsw.deskhero.model.User;
import pl.grsw.deskhero.repository.UserRepository;
import pl.grsw.deskhero.security.JwtTokenProvider;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional // Dodajemy adnotację Transactional, ponieważ operacja modyfikuje stan bazy danych
    public UserRegisterResponseDto registerUser(UserRegisterRequestDto requestDto) {
        // 1. Sprawdź, czy użytkownik już istnieje
        if (userRepository.existsByUsername(requestDto.username())) {
            throw new UserAlreadyExistsException("Użytkownik o podanym adresie email już istnieje: " + requestDto.username());
        }

        // 2. Stwórz nowego użytkownika
        User user = new User();
        user.setUsername(requestDto.username());
        user.setName(requestDto.name());
        user.setPassword(passwordEncoder.encode(requestDto.password())); // Hashowanie hasła

        // 3. Zapisz użytkownika w bazie danych
        User savedUser = userRepository.save(user);

        // 4. Przypisanie roli - na razie pominięte
        // TODO: Implementacja przypisania domyślnej roli (np. ROLE_USER)

        // 5. Wygeneruj token JWT
        String token = jwtTokenProvider.generateToken(savedUser);

        // 6. Przygotuj odpowiedź
        UserDto userDto = UserDto.fromModel(savedUser);

        return new UserRegisterResponseDto("User registered successfully", userDto, token);
    }
} 
