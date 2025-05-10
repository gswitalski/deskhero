package pl.grsw.deskhero.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.grsw.deskhero.dto.*;
import pl.grsw.deskhero.exception.UserAlreadyExistsException;
import pl.grsw.deskhero.model.Authority;
import pl.grsw.deskhero.model.User;
import pl.grsw.deskhero.repository.UserRepository;
import pl.grsw.deskhero.security.JwtTokenProvider;

import java.util.Set;
import java.util.stream.Collectors;

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

        // 3. Przypisanie domyślnej roli ROLE_USER
        user.addAuthority("ROLE_USER");

        // 4. Zapisz użytkownika w bazie danych (kaskadowo zapisze też role)
        User savedUser = userRepository.save(user);

        // 5. Wygeneruj token JWT
        String token = jwtTokenProvider.generateToken(savedUser);

        // 6. Przygotuj odpowiedź
        return new UserRegisterResponseDto(token, 86400); // 86400 sekund = 24 godziny
    }
    
    @Override
    @Transactional(readOnly = true) // Operacja tylko do odczytu
    public UserLoginResponseDto authenticate(UserLoginRequestDto requestDto) {
        // 1. Znajdź użytkownika po nazwie użytkownika (email)
        User user = userRepository.findByUsername(requestDto.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Nieprawidłowa nazwa użytkownika lub hasło"));

        // 2. Weryfikuj hasło
        if (!passwordEncoder.matches(requestDto.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Nieprawidłowa nazwa użytkownika lub hasło");
        }

        // 3. Pobierz role użytkownika
        Set<String> roles = user.getAuthorities()
                .stream()
                .map(Authority::getAuthority)
                .collect(Collectors.toSet());

        // 4. Wygeneruj token JWT zawierający informacje o rolach
        String token = jwtTokenProvider.generateToken(user);

        // 5. Zwróć odpowiedź z tokenem, czasem ważności w sekundach i imieniem użytkownika
        return new UserLoginResponseDto(token, 86400, user.getName()); // 86400 sekund = 24 godziny
    }
} 
