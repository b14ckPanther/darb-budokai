package dev.zangeel.budokai.character;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import dev.zangeel.budokai.testsupport.arch.BudokaiArchitectureRules;

@AnalyzeClasses(packages = "dev.zangeel.budokai.character", importOptions = ImportOption.DoNotIncludeTests.class)
class CharacterArchitectureTest {

    @ArchTest
    static final ArchRule noJavaUtilRandom = BudokaiArchitectureRules.NO_JAVA_UTIL_RANDOM;

    @ArchTest
    static final ArchRule noHardcodedNumbers = BudokaiArchitectureRules.NO_HARDCODED_NUMBERS_IN_RULES_OR_DOMAIN;
}
