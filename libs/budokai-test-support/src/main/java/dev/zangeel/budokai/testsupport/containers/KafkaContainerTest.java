package dev.zangeel.budokai.testsupport.containers;

import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.kafka.KafkaContainer;

/** Base class for tests that need Kafka (KRaft). One container per JVM. */
public abstract class KafkaContainerTest {

    @ServiceConnection
    protected static final KafkaContainer KAFKA = new KafkaContainer(ContainerImages.kafka());

    static {
        KAFKA.start();
    }
}
