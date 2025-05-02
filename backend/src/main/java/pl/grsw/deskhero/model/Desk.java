package pl.grsw.deskhero.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Desk")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Desk {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String roomName;

    @Column(nullable = false, length = 100)
    private String deskNumber;
} 
