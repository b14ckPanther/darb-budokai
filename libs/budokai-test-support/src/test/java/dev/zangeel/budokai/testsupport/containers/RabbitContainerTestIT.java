package dev.zangeel.budokai.testsupport.containers;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.AmqpAdmin;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(
        classes = ContainerTestApp.class,
        properties = "spring.autoconfigure.exclude="
                + "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,"
                + "org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration")
class RabbitContainerTestIT extends RabbitContainerTest {

    @Autowired
    AmqpAdmin admin;

    @Autowired
    RabbitTemplate rabbit;

    @Test
    void connectsSpringToTheSharedRabbitContainer() {
        admin.declareQueue(new Queue("test.ping"));
        rabbit.convertAndSend("test.ping", "ping");
        assertThat(rabbit.receiveAndConvert("test.ping", 10_000)).isEqualTo("ping");
    }
}
