package dev.zangeel.budokai.testsupport.containers;

import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Base class for tests that need PostgreSQL. One container per JVM, started on first use and
 * removed by Testcontainers when the JVM exits; Spring Boot wires the datasource through
 * {@link ServiceConnection}.
 */
public abstract class PostgresContainerTest {

    @ServiceConnection
    protected static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>(ContainerImages.postgres());

    static {
        POSTGRES.start();
    }
}
