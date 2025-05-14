import 'jest-preset-angular/setup-jest';
import '@testing-library/jest-dom';

// Globalne zmienne środowiskowe
globalThis.__Zone_disable_requestAnimationFrame = true;
globalThis.__Zone_disable_timers = true;

// Funkcje pomocnicze dla testów asynchronicznych
jest.setTimeout(10000); // 10 sekund timeout dla testów
