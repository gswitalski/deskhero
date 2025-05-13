package pl.grsw.deskhero.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DeskAlreadyExistsException extends RuntimeException {
    public DeskAlreadyExistsException(String message) {
        super(message);
    }
} 
