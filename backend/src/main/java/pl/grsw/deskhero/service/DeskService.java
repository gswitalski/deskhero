package pl.grsw.deskhero.service;

import pl.grsw.deskhero.dto.DeskAvailabilityDto;

import java.time.LocalDate;
import java.util.List;

public interface DeskService {
    List<DeskAvailabilityDto> getDesksAvailability(LocalDate date);
} 
