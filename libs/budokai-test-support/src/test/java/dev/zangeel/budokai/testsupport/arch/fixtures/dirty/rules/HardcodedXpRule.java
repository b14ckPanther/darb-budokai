package dev.zangeel.budokai.testsupport.arch.fixtures.dirty.rules;

/** Fixture: a game number baked into code, which the rules must reject. */
public final class HardcodedXpRule {
    static final int XP_TO_LEVEL_TWO = 100;

    public int xpToLevelTwo() {
        return XP_TO_LEVEL_TWO;
    }
}
