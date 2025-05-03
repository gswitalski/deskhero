package pl.grsw.deskhero.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Wyłącza ochronę CSRF (Cross-Site Request Forgery)
                // Jest to często robione w przypadku API bezstanowych
                .csrf(AbstractHttpConfigurer::disable)
                // Konfiguruje reguły autoryzacji żądań HTTP
                .authorizeHttpRequests(authorize -> authorize
                        // Zezwala na wszystkie żądania bez uwierzytelniania
                        .anyRequest().permitAll()
                );

        // Buduje i zwraca skonfigurowany łańcuch filtrów bezpieczeństwa
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
} 
