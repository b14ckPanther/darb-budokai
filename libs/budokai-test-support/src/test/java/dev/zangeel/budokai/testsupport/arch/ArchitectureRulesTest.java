package dev.zangeel.budokai.testsupport.arch;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import org.junit.jupiter.api.Test;

class ArchitectureRulesTest {

    private static final String FIXTURES = "dev.zangeel.budokai.testsupport.arch.fixtures";

    private final JavaClasses clean = new ClassFileImporter().importPackages(FIXTURES + ".clean");
    private final JavaClasses dirty = new ClassFileImporter().importPackages(FIXTURES + ".dirty");

    @Test
    void rejectsJavaUtilRandomInMainCode() {
        assertThatThrownBy(() -> BudokaiArchitectureRules.NO_JAVA_UTIL_RANDOM.check(dirty))
                .isInstanceOf(AssertionError.class)
                .hasMessageContaining("UsesJavaUtilRandom");
    }

    @Test
    void rejectsNumericConstantsOtherThanZeroAndOneInRulesPackages() {
        assertThatThrownBy(() -> BudokaiArchitectureRules.NO_HARDCODED_NUMBERS_IN_RULES_OR_DOMAIN.check(dirty))
                .isInstanceOf(AssertionError.class)
                .hasMessageContaining("XP_TO_LEVEL_TWO");
    }

    @Test
    void rejectsNumericConstantsOtherThanZeroAndOneInDomainPackages() {
        assertThatThrownBy(() -> BudokaiArchitectureRules.NO_HARDCODED_NUMBERS_IN_RULES_OR_DOMAIN.check(dirty))
                .isInstanceOf(AssertionError.class)
                .hasMessageContaining("STAMINA_PER_MINUTE");
    }

    @Test
    void allowsZeroOneConstantsAndInjectedRandomness() {
        assertThatCode(() -> BudokaiArchitectureRules.ALL.forEach(rule -> rule.check(clean)))
                .doesNotThrowAnyException();
    }
}
