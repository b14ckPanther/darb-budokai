package dev.zangeel.budokai.character;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;

/** The service reads the repo-root .env when run locally, so `spring-boot:run` needs no shell setup. */
class LocalEnvImportTest {

    @Test
    void readsDatabaseSettingsFromTheEnvFileNamedByBudokaiEnvFile(@TempDir Path dir) throws IOException {
        Path env = dir.resolve(".env");
        Files.write(env, List.of("# comment", "CHARACTER_DB_PASSWORD=from-env-file", "CHARACTER_DB_USER=env_user"));

        try (ConfigurableApplicationContext context = new SpringApplicationBuilder(Empty.class)
                .web(WebApplicationType.NONE)
                .properties("budokai.env-file=" + env.toAbsolutePath())
                .run()) {
            Environment environment = context.getEnvironment();
            assertThat(environment.getProperty("spring.datasource.password")).isEqualTo("from-env-file");
            assertThat(environment.getProperty("spring.datasource.username")).isEqualTo("env_user");
        }
    }

    @Test
    void startsWithoutAnEnvFile(@TempDir Path dir) {
        try (ConfigurableApplicationContext context = new SpringApplicationBuilder(Empty.class)
                .web(WebApplicationType.NONE)
                .properties("budokai.env-file=" + dir.resolve("missing.env").toAbsolutePath())
                .run()) {
            assertThat(context.getEnvironment().getProperty("spring.datasource.username"))
                    .isEqualTo("character_svc");
        }
    }

    @org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
    static class Empty {}
}
