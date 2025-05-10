package pl.grsw.deskhero.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode
public class AuthorityId implements Serializable {
    
    @Column(name = "username")
    private String username;
    
    @Column(name = "authority")
    private String authority;
} 
