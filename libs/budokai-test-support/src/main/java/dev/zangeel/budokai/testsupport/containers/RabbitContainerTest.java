package dev.zangeel.budokai.testsupport.containers;

import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.RabbitMQContainer;

/** Base class for tests that need RabbitMQ. One container per JVM. */
public abstract class RabbitContainerTest {

    @ServiceConnection
    protected static final RabbitMQContainer RABBIT = new RabbitMQContainer(ContainerImages.rabbitmq());

    static {
        RABBIT.start();
    }
}
