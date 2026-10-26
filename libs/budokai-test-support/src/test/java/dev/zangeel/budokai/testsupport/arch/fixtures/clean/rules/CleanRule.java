package dev.zangeel.budokai.testsupport.arch.fixtures.clean.rules;

import java.util.random.RandomGenerator;

/** Fixture: allowed shapes (0 and 1 constants, injected randomness, rates from config). */
public final class CleanRule {
    static final int NONE = 0;
    static final double ONE = 1.0;
    static final String RULE_ID = "posture.good-minutes";

    private final RandomGenerator random;
    private final int xpPerMinute;

    public CleanRule(RandomGenerator random, int xpPerMinute) {
        this.random = random;
        this.xpPerMinute = xpPerMinute;
    }

    public int award(int minutes) {
        return minutes * xpPerMinute + (random.nextBoolean() ? NONE : (int) ONE) * NONE;
    }
}
