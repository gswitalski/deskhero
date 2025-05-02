package pl.grsw.deskhero.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.grsw.deskhero.model.Desk;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeskRequestDto {

    @NotBlank(message = "Nazwa pomieszczenia nie może być pusta")
    private String roomName;

    @NotBlank(message = "Numer biurka nie może być pusty")
    private String deskNumber;

    /**
     * Tworzy obiekt modelu Desk na podstawie danych z DTO.
     * Uwaga: ID nie jest ustawiane, ponieważ jest generowane przez bazę danych.
     * @return Obiekt Desk.
     */
    public Desk toModel() {
        Desk desk = new Desk();
        desk.setRoomName(this.roomName);
        desk.setDeskNumber(this.deskNumber);
        return desk;
    }
} 
