package pl.grsw.deskhero.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import pl.grsw.deskhero.dto.ErrorDto;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // Handler dla błędów walidacji @Valid
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorDto> handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        String message = "Validation failed: " + errors.toString();
        log.warn("Validation error: {}", message); // Logujemy błąd walidacji

        ErrorDto errorDto = new ErrorDto(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                message,
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorDto, HttpStatus.BAD_REQUEST);
    }

    // Handler dla wyjątku UserAlreadyExistsException
    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ErrorDto> handleUserAlreadyExistsException(UserAlreadyExistsException ex, HttpServletRequest request) {
        log.warn("Conflict error: {}", ex.getMessage()); // Logujemy błąd konfliktu
        ErrorDto errorDto = new ErrorDto(
                LocalDateTime.now(),
                HttpStatus.CONFLICT.value(),
                HttpStatus.CONFLICT.getReasonPhrase(),
                ex.getMessage(), // Używamy wiadomości z wyjątku
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorDto, HttpStatus.CONFLICT);
    }

    // Ogólny handler dla innych wyjątków RuntimeException
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorDto> handleGenericRuntimeException(RuntimeException ex, HttpServletRequest request) {
        log.error("Unhandled RuntimeException: ", ex); // Logujemy błąd serwera ze stack trace
        ErrorDto errorDto = new ErrorDto(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                "Wystąpił wewnętrzny błąd serwera.", // Generyczny komunikat dla użytkownika
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorDto, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Można dodać handlery dla bardziej specyficznych wyjątków, np. DataAccessException
} 
