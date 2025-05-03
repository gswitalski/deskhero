package pl.grsw.deskhero.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.grsw.deskhero.model.User;

import java.util.Optional;

/**
 * Repozytorium Spring Data JPA dla encji {@link User}.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Znajduje użytkownika na podstawie jego nazwy użytkownika (adresu email).
     *
     * @param username Nazwa użytkownika (adres email).
     * @return Optional zawierający znalezionego użytkownika lub pusty, jeśli użytkownik nie istnieje.
     */
    Optional<User> findByUsername(String username);

    /**
     * Sprawdza, czy istnieje użytkownik o podanej nazwie użytkownika (adresie email).
     *
     * @param username Nazwa użytkownika (adres email).
     * @return true, jeśli użytkownik istnieje, false w przeciwnym razie.
     */
    boolean existsByUsername(String username);
} 
