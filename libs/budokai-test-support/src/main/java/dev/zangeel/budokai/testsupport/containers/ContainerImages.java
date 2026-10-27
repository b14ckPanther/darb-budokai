package dev.zangeel.budokai.testsupport.containers;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.Properties;
import org.testcontainers.utility.DockerImageName;

/** Resolves container images from {@code budokai-test-containers.properties} or system properties. */
public final class ContainerImages {

    private static final String RESOURCE = "/budokai-test-containers.properties";
    private static final Properties DEFAULTS = load();

    private ContainerImages() {}

    public static DockerImageName postgres() {
        return image("postgres");
    }

    public static DockerImageName kafka() {
        return image("kafka");
    }

    public static DockerImageName rabbitmq() {
        return image("rabbitmq");
    }

    static DockerImageName image(String name) {
        String key = "budokai.test.image." + name;
        String value = System.getProperty(key, DEFAULTS.getProperty(key));
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("No container image configured for " + key);
        }
        return DockerImageName.parse(value);
    }

    private static Properties load() {
        Properties properties = new Properties();
        try (InputStream in = ContainerImages.class.getResourceAsStream(RESOURCE)) {
            if (in == null) {
                throw new IllegalStateException("Missing classpath resource " + RESOURCE);
            }
            properties.load(in);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return properties;
    }
}
