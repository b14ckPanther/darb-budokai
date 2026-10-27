package dev.zangeel.budokai.character;

import static org.assertj.core.api.Assertions.assertThat;

import dev.zangeel.budokai.testsupport.containers.PostgresContainerTest;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class HealthEndpointIT extends PostgresContainerTest {

    @Autowired
    TestRestTemplate http;

    @Test
    @SuppressWarnings("rawtypes")
    void healthEndpointReportsUp() {
        ResponseEntity<Map> response = http.getForEntity("/actuator/health", Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("status", "UP");
    }

    @Test
    void healthEndpointDoesNotExposeDetailsAnonymously() {
        String body = http.getForObject("/actuator/health", String.class);

        assertThat(body).doesNotContain("PostgreSQL").doesNotContain("jdbc:");
    }
}
