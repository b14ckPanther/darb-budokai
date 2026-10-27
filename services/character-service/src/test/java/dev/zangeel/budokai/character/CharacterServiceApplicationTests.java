package dev.zangeel.budokai.character;

import static org.assertj.core.api.Assertions.assertThat;

import dev.zangeel.budokai.testsupport.containers.PostgresContainerTest;
import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class CharacterServiceApplicationTests extends PostgresContainerTest {

    @Autowired
    DataSource dataSource;

    @Test
    void contextLoadsAgainstTestcontainersPostgres() throws Exception {
        try (var connection = dataSource.getConnection()) {
            assertThat(connection.getMetaData().getURL()).isEqualTo(POSTGRES.getJdbcUrl());
        }
    }
}
