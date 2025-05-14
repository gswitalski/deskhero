# Plan testów – DeskHero

## 1. Wprowadzenie i cele testowania  
Celem testowania jest weryfikacja jakości, stabilności i bezpieczeństwa aplikacji DeskHero. Plan ma zapewnić:
- Poprawność biznesowej logiki rezerwacji biurek  
- Spójność i niezawodność interfejsu użytkownika  
- Niezawodność API i integracji z bazą danych  
- Wydajność pod obciążeniem (do 200 użytkowników)  
- Odporność na ataki i naruszenia bezpieczeństwa  

## 2. Zakres testów  
- Testy jednostkowe (frontend, backend)  
- Testy integracyjne (komunikacja frontend–backend, backend–DB)  
- Testy end-to-end (scenariusze kluczowe)  
- Testy wizualne (zgodność UI)
- Testy wydajnościowe (obciążeniowe, stresowe)  
- Testy bezpieczeństwa (OWASP Top 10, audyt Spring Security)  
- Testy kompatybilności przeglądarek i responsywności  
- Testy kontraktów (zgodność API)

## 3. Typy testów do przeprowadzenia  
| Poziom testów            | Technologie / narzędzia                    |
|--------------------------|-------------------------------------------|
| Jednostkowe frontend     | Jest, Testing Library (@testing-library/angular) |
| Jednostkowe backend      | JUnit 5, Mockito, AssertJ, Spring Boot Test |
| Integracyjne backend-DB  | Testcontainers z PostgreSQL                |
| E2E                      | Cypress lub Playwright                     |
| API (manual/automatyczne)| REST Assured, Karate                       |
| Kontraktowe API          | Spring Cloud Contract lub Pact             |
| Wydajnościowe            | k6, JMeter, Gatling                        |
| Bezpieczeństwa           | OWASP ZAP, SonarQube, Dependency-Check, Snyk |
| Wizualne                 | Percy lub Applitools                       |

## 4. Scenariusze testowe dla kluczowych funkcjonalności  

### 4.1. Rejestracja i logowanie  
- Rejestracja z prawidłowymi danymi → konto utworzone, mail aktywacyjny  
- Rejestracja z duplikatem e-mail → komunikat o błędzie  
- Logowanie z poprawnymi i niepoprawnymi danymi  
- Utrzymanie sesji, automatyczne wylogowanie po czasie  

### 4.2. Rezerwacja biurka  
- Rezerwacja dostępnego biurka na wybrany dzień  
- Próba rezerwacji już zajętego biurka → walidacja po stronie front/backend  
- Rezerwacja z datą przeszłą lub nieprawidłowym formatem → komunikat walidacji  

### 4.3. Anulowanie rezerwacji  
- Anulowanie własnej rezerwacji przed terminem  
- Próba anulowania rezerwacji sprzed daty bieżącej → niedozwolone  
- Sprawdzenie automatycznego odblokowania biurka  

### 4.4. Historia rezerwacji  
- Wyświetlenie listy przeszłych i przyszłych rezerwacji  
- Paginacja i filtrowanie datami  

### 4.5. Zarządzanie biurkami (role Admin)  
- Dodawanie / edycja / usuwanie biurek  
- Przypisywanie biurkom atrybutów (numer, lokalizacja)  
- Zarządzanie kontami użytkowników (blokada, zmiana ról)  

## 5. Środowisko testowe  
- Dedykowany klaster Docker Compose:  
  - Frontend (Angular)  
  - Backend (Spring Boot)  
  - PostgreSQL (testowa baza poprzez Testcontainers)
- Baza danych resetowana przed zestawem testów  
- Oddzielne konta testowe (użytkownik, admin)  
- Dostęp do narzędzi do testów wydajności i bezpieczeństwa  

## 6. Narzędzia do testowania  
- Frontend: Jest, Testing Library, Cypress/Playwright, Percy  
- Backend: JUnit 5, Mockito, AssertJ, Testcontainers, REST Assured
- API: REST Assured, Karate, Spring Cloud Contract
- Wydajność: k6, JMeter, Gatling  
- Bezpieczeństwo: OWASP ZAP, SonarQube, Dependency-Check, Snyk
- CI/CD: GitHub Actions (automatyzacja uruchamiania testów)  
- Raportowanie: Allure Framework
- Analiza pokrycia: JaCoCo (backend), Istanbul (frontend) 
- Repozytorium błędów: Jira  

## 7. Harmonogram testów  

| Etap                           | Czas trwania       |
|--------------------------------|--------------------|
| Przygotowanie środowiska       | 1 tydzień          |
| Testy jednostkowe              | 1–2 tydzień        |
| Testy integracyjne             | 2 tydzień          |
| Testy e2e                      | 2–3 tydzień        |
| Testy wydajnościowe            | 3 tydzień          |
| Testy bezpieczeństwa           | 3 tydzień          |
| Testy regresyjne i zamknięcie  | 4 tydzień          |

## 8. Kryteria akceptacji testów  
- Pokrycie testami jednostkowymi ≥ 80% linii kodu (mierzone przez JaCoCo/Istanbul)
- Wszystkie krytyczne i wysokie defekty naprawione i zweryfikowane  
- Brak krytycznych usterek w testach e2e  
- Wyniki testów wydajnościowych spełniają założone SLA (czas odpowiedzi < 500 ms)  
- Raport bezpieczeństwa bez krytycznych luk OWASP
- Wszystkie testy kontraktów API pomyślne
- Brak regresji wizualnych w Percy/Applitools

## 9. Role i odpowiedzialności  
- QA Lead: definicja planu, koordynacja, raport końcowy  
- QA Engineer: pisanie i wykonywanie testów  
- Developerzy: implementacja poprawek  
- DevOps: utrzymanie środowiska CI/CD i testowego  
- Product Owner: akceptacja wyników testów  

## 10. Procedury raportowania błędów  
1. Zgłaszanie w Jira z kategorią (Krytyczny/Wysoki/Średni/Niski)  
2. Dołączenie kroków odtworzenia, zrzutów ekranu/logów  
3. Triage dzienny spotkań zespołu  
4. Retesty po weryfikacji poprawek  
5. Dokumentacja statusu w raportach tygodniowych z wykorzystaniem Allure
