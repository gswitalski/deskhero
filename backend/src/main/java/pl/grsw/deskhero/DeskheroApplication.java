package pl.grsw.deskhero;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import pl.grsw.deskhero.security.JwtProperties;

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
public class DeskheroApplication {

	public static void main(String[] args) {
		SpringApplication.run(DeskheroApplication.class, args);
	}

}
