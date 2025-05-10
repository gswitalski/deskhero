package pl.grsw.deskhero.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "authorities")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Authority {
    
    @EmbeddedId
    private AuthorityId id;
    
    @Column(name = "authority", insertable = false, updatable = false)
    private String authority;
    
    @Column(name = "username", insertable = false, updatable = false)
    private String username;
    
    @ManyToOne
    @JoinColumn(name = "username", referencedColumnName = "username", insertable = false, updatable = false)
    private User user;
    
    // Konstruktor pomocniczy
    public Authority(String username, String authority) {
        this.id = new AuthorityId(username, authority);
        this.username = username;
        this.authority = authority;
    }
} 
