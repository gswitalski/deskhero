package pl.grsw.deskhero.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
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
        log.warn("Validation error for request {}: {}", request.getRequestURI(), message);

        ErrorDto errorDto = new ErrorDto(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                message,
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorDto, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    // @ResponseStatus(HttpStatus.BAD_REQUEST) // Można usunąć, bo ResponseEntity ustawia status
    public ResponseEntity<ErrorDto> handleTypeMismatchException(MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        String fieldName = ex.getName();
        String requiredType = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown";
        String providedValue = ex.getValue() != null ? ex.getValue().toString() : "null";

        String message = String.format("Invalid parameter: '%s'. Expected type: '%s', but received value: '%s'.",
                fieldName, requiredType, providedValue);

        // Bardziej szczegółowy komunikat dla błędu formatu daty
        if (fieldName.equalsIgnoreCase("date") && ex.getCause() instanceof java.time.format.DateTimeParseException) {
             message = String.format("Invalid date format for parameter '%s'. Please use YYYY-MM-DD. Received value: '%s'.", fieldName, providedValue);
        }
        
        log.warn("Type mismatch error for request {}: {}. Root cause: {}", request.getRequestURI(), message, ex.getCause() != null ? ex.getCause().getMessage() : "N/A", ex);

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
        log.warn("Conflict error for request {}: {}", request.getRequestURI(), ex.getMessage());
        ErrorDto errorDto = new ErrorDto(
                LocalDateTime.now(),
                HttpStatus.CONFLICT.value(),
                HttpStatus.CONFLICT.getReasonPhrase(),
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorDto, HttpStatus.CONFLICT);
    }

    // Ogólny handler dla innych wyjątków RuntimeException
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorDto> handleGenericRuntimeException(RuntimeException ex, HttpServletRequest request) {
        log.error("Unhandled RuntimeException for request {}: ", request.getRequestURI(), ex);
        ErrorDto errorDto = new ErrorDto(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                "Wystąpił wewnętrzny błąd serwera.",
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorDto, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Można dodać handlery dla bardziej specyficznych wyjątków, np. DataAccessException
} 
