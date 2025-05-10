package pl.grsw.deskhero.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import pl.grsw.deskhero.model.User;
import pl.grsw.deskhero.repository.UserRepository;

/**
 * Konfiguracja inicjalizująca podstawowe dane w systemie.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Bean inicjalizujący dane po uruchomieniu aplikacji.
     * @return CommandLineRunner, który zostanie wykonany po uruchomieniu aplikacji.
     */
    @Bean
    public CommandLineRunner initData() {
        return args -> {
            initAdmin();
        };
    }

    /**
     * Inicjalizuje konto administratora, jeśli nie istnieje.
     */
    @Transactional
    public void initAdmin() {
        String adminEmail = "admin@deskhero.pl";

        if (!userRepository.existsByUsername(adminEmail)) {
            log.info("Tworzenie konta administratora: {}", adminEmail);
            
            User admin = new User();
            admin.setUsername(adminEmail);
            admin.setName("Administrator");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.addAuthority("ROLE_USER");
            admin.addAuthority("ROLE_ADMIN");
            
            userRepository.save(admin);
            
            log.info("Utworzono konto administratora: {}", adminEmail);
        } else {
            log.info("Konto administratora już istnieje: {}", adminEmail);
        }
    }
} 
