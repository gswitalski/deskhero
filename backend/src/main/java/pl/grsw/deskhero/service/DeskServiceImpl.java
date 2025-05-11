package pl.grsw.deskhero.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.grsw.deskhero.dto.DeskAvailabilityDto;
import pl.grsw.deskhero.model.Desk;
import pl.grsw.deskhero.repository.DeskRepository;
import pl.grsw.deskhero.repository.ReservationRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeskServiceImpl implements DeskService {

    private final DeskRepository deskRepository;
    private final ReservationRepository reservationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DeskAvailabilityDto> getDesksAvailability(LocalDate date) {
        List<Desk> allDesks = deskRepository.findAll();

        return allDesks.stream()
                .map(desk -> {
                    boolean isReserved = reservationRepository.existsByDeskIdAndReservationDate(
                            desk.getId(),
                            date
                    );
                    return DeskAvailabilityDto.fromModel(desk, !isReserved);
                })
                .collect(Collectors.toList());
    }
} 
