package pl.grsw.deskhero.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import pl.grsw.deskhero.security.JwtAuthenticationFilter;
import pl.grsw.deskhero.security.JwtTokenProvider;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Wyłącza ochronę CSRF (Cross-Site Request Forgery) dla API REST
                .csrf(AbstractHttpConfigurer::disable)
                // Konfiguracja sesji jako STATELESS ponieważ używamy JWT
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Konfiguruje reguły autoryzacji żądań HTTP
                .authorizeHttpRequests(authorize -> authorize
                        // Zezwala na dostęp do endpointów rejestracji i logowania bez uwierzytelniania
                        .requestMatchers("/api/users/register", "/api/users/login").permitAll()
                        // Zezwala na dostęp do przeglądania dostępności biurek bez logowania
                        .requestMatchers("/api/guest/desks/**").permitAll()
                        // Tylko administratorzy mają dostęp do tworzenia biurek
                        .requestMatchers(HttpMethod.POST, "/api/desks").hasRole("ADMIN")
                        // Tylko administratorzy mają dostęp do endpointów administracyjnych
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        // Tylko administratorzy mają dostęp do usuwania biurek
                        .requestMatchers(HttpMethod.DELETE, "/api/desks/**").hasRole("ADMIN")
                        // Wymaga uwierzytelnienia dla wszystkich pozostałych żądań
                        .anyRequest().authenticated()
                )
                // Dodanie filtru JWT przed filtrem domyślnego uwierzytelnienia
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        // Buduje i zwraca skonfigurowany łańcuch filtrów bezpieczeństwa
        return http.build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
} 
