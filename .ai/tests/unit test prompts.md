## Propty dla backend

Które elementy tego fragmentu projektu {{plik_z_implementacją}} warto przetestować z wykorzystaniem unit testów i dlaczego?

Przygotuj zestaw testów jednostkowych dla {{plik_z_implementacją}} z uwzględnieniem kluczowych reguł biznesowych i warunków brzegowych {{prd_projektu}}  {{api_plan}}. Zpisz testy w projekcie.





Jesteś starszym programistą Java specjalizującym się w aplikacjach Spring Boot. Twoim zadaniem jest stworzenie kompleksowego zestawu testów jednostkowych dla komponentu zaplecza w oparciu o dostarczoną implementację, wymagania projektu i specyfikację API.

Najpierw przejrzyj następujące informacje:

1. Wymagania projektu (PRD):
<project_requirements>
{{prd_projektu}}
</project_requirements>

2. Specyfikacja API:
<api_specification>
{{api_plan}}
</api_specification>

3. Plik implementacji:
<implementation_file>
{{plik_z_implementacją}}
</implementation_file>

Przed napisaniem testów jednostkowych przeanalizuj dostarczone informacje i zaplanuj podejście w bloku myślowym ujętym w znaczniki <test_planning>. Ta sekcja może być dość długa.

Podczas planowania testów weź pod uwagę następujące kwestie:
1. Określ, czy implementacja jest usługą, czy kontrolerem.
2. Podaj kluczowe części specyfikacji PRD i API odnoszące się do testowania.
3. Wypisz wszystkie metody publiczne w pliku implementacji.
4. Dla każdej metody:
- Zidentyfikuj potencjalne przypadki skrajne i scenariusze błędów.
- Utwórz plan testów wysokiego poziomu.
5. Zaplanuj, jak ustrukturyzować klasę testową i poszczególne metody testowe.

Po przeprowadzeniu analizy utwórz zestaw testów jednostkowych dla komponentu Spring Boot. Twoje testy powinny:
- Objąć wszystkie główne funkcjonalności opisane w pliku implementacji
- Zweryfikować zgodność z zasadami biznesowymi z PRD
- Testować punkty końcowe lub metody API zgodnie ze specyfikacją w planie API
- Obejmować zarówno pozytywne scenariusze, jak i przypadki skrajne
- Używać odpowiednich adnotacji i asercji testowych Spring Boot

Zaprezentuj swoje testy jednostkowe w dobrze ustrukturyzowanej klasie Java. Używaj opisowych nazw metod dla każdego testu i dołącz komentarze, aby wyjaśnić cel każdego testu.

Oto podstawowa struktura do naśladowania:

```java
import org.junit.jupiter.api.Test; import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.mockito.Mockito;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class YourComponentNameTest {

@MockBean
private DependencyClass dependency;

@Test
public void testMethodName_Scenario_ExpectedResult() {
// Arrange
// Act
// Assert
}

// Dodaj więcej metod testowych tutaj
}
```

Upewnij się, że Twoje testy są kompleksowe i obejmują wszystkie krytyczne aspekty funkcjonalności komponentu.

Wynik końcowy powinien zawierać wyłącznie klasę Java z testami jednostkowymi i nie powinien powielać ani powtarzać żadnej z prac wykonanych w sekcji planowania testów.
