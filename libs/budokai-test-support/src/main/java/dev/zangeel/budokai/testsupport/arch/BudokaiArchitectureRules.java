package dev.zangeel.budokai.testsupport.arch;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.fields;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.domain.JavaField;
import com.tngtech.archunit.core.domain.JavaModifier;
import com.tngtech.archunit.lang.ArchCondition;
import com.tngtech.archunit.lang.ArchRule;
import com.tngtech.archunit.lang.ConditionEvents;
import com.tngtech.archunit.lang.SimpleConditionEvent;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Architecture rules every Darb Budokai service applies to its main code.
 *
 * <p>Usage in a service: {@code @AnalyzeClasses(packages = "dev.zangeel.budokai.<service>",
 * importOptions = ImportOption.DoNotIncludeTests.class)} with {@code @ArchTest} fields pointing at
 * these rules.
 */
public final class BudokaiArchitectureRules {

    private static final Set<Class<?>> NUMERIC_TYPES = Set.of(
            byte.class,
            short.class,
            int.class,
            long.class,
            float.class,
            double.class,
            Byte.class,
            Short.class,
            Integer.class,
            Long.class,
            Float.class,
            Double.class,
            BigDecimal.class);

    /** Randomness must come from an injected, seeded {@code RandomGenerator} (deterministic loot). */
    public static final ArchRule NO_JAVA_UTIL_RANDOM = noClasses()
            .should()
            .dependOnClassesThat()
            .areAssignableTo(java.util.Random.class)
            .because("randomness must be injected and seeded (CONVENTIONS.md, ADR-026)");

    /** Game numbers live in the rulebook config, not in code. Only 0 and 1 are allowed. */
    public static final ArchRule NO_HARDCODED_NUMBERS_IN_RULES_OR_DOMAIN = fields().that()
            .areDeclaredInClassesThat()
            .resideInAnyPackage("..rules..", "..domain..")
            .and()
            .haveModifier(JavaModifier.STATIC)
            .and()
            .haveModifier(JavaModifier.FINAL)
            .should(holdOnlyZeroOrOneWhenNumeric())
            .because("game rules and numbers belong in config/** (ADR-011, agent manual 1.2)")
            .allowEmptyShould(true);

    public static final List<ArchRule> ALL = List.of(NO_JAVA_UTIL_RANDOM, NO_HARDCODED_NUMBERS_IN_RULES_OR_DOMAIN);

    private BudokaiArchitectureRules() {}

    private static ArchCondition<JavaField> holdOnlyZeroOrOneWhenNumeric() {
        return new ArchCondition<>("hold only 0 or 1 when numeric") {
            @Override
            public void check(JavaField field, ConditionEvents events) {
                numericValue(field).ifPresent(value -> {
                    boolean allowed = value.compareTo(BigDecimal.ZERO) == 0 || value.compareTo(BigDecimal.ONE) == 0;
                    String message =
                            "%s.%s = %s".formatted(field.getOwner().getName(), field.getName(), value.toPlainString());
                    events.add(new SimpleConditionEvent(field, allowed, message));
                });
            }
        };
    }

    private static Optional<BigDecimal> numericValue(JavaField javaField) {
        if (!NUMERIC_TYPES.contains(javaField.getRawType().reflect())) {
            return Optional.empty();
        }
        try {
            Field field = javaField.reflect();
            field.setAccessible(true);
            Object value = field.get(null);
            return value == null ? Optional.empty() : Optional.of(new BigDecimal(value.toString()));
        } catch (ReflectiveOperationException | RuntimeException e) {
            throw new IllegalStateException("Cannot read constant " + javaField.getFullName(), e);
        }
    }
}
