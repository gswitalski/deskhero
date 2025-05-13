package pl.grsw.deskhero.service;

import pl.grsw.deskhero.dto.DeskAvailabilityDto;
import pl.grsw.deskhero.dto.DeskDto;

import java.time.LocalDate;
import java.util.List;

public interface DeskService {
    List<DeskAvailabilityDto> getDesksAvailability(LocalDate date);
    List<DeskDto> getAllDesks();
} 
