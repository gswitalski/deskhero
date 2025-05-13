package pl.grsw.deskhero.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.grsw.deskhero.model.Desk;

/**
 * Repozytorium Spring Data JPA dla encji {@link Desk}.
 */
@Repository
public interface DeskRepository extends JpaRepository<Desk, Long> {

    /**
     * Sprawdza, czy istnieje biurko o podanej nazwie pokoju i numerze biurka.
     * Służy do zapobiegania tworzeniu duplikatów.
     *
     * @param roomName Nazwa pokoju.
     * @param deskNumber Numer biurka.
     * @return true, jeśli biurko o podanej kombinacji już istnieje, false w przeciwnym razie.
     */
    boolean existsByRoomNameAndDeskNumber(String roomName, String deskNumber);

    /**
     * Sprawdza, czy istnieje biurko o podanej nazwie pokoju i numerze biurka, pomijając biurko o zadanym ID.
     * @param roomName nazwa pokoju
     * @param deskNumber numer biurka
     * @param id ID biurka, które należy pominąć
     * @return true, jeśli istnieje inne biurko o tej samej kombinacji, false w przeciwnym razie
     */
    boolean existsByRoomNameAndDeskNumberAndIdNot(String roomName, String deskNumber, Long id);
} 
