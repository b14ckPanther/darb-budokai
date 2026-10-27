package dev.zangeel.budokai.testsupport.containers;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest(
        classes = ContainerTestApp.class,
        properties = "spring.autoconfigure.exclude="
                + "org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration,"
                + "org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration")
class PostgresContainerTestIT extends PostgresContainerTest {

    @Autowired
    JdbcTemplate jdbc;

    @Test
    void connectsSpringToTheSharedPostgresContainer() {
        String version = jdbc.queryForObject("select version()", String.class);
        assertThat(version).startsWith("PostgreSQL 17");
    }
}
