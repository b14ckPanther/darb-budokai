package dev.zangeel.budokai.testsupport.containers;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;

@SpringBootTest(
        classes = ContainerTestApp.class,
        properties = "spring.autoconfigure.exclude="
                + "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,"
                + "org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration")
class KafkaContainerTestIT extends KafkaContainerTest {

    @Autowired
    KafkaTemplate<String, String> kafka;

    @Test
    void connectsSpringToTheSharedKafkaContainer() throws Exception {
        SendResult<String, String> result =
                kafka.send("budokai.test.ping.v1", "user-1", "ping").get(30, TimeUnit.SECONDS);
        assertThat(result.getRecordMetadata().topic()).isEqualTo("budokai.test.ping.v1");
    }
}
