package dev.zangeel.budokai.testsupport.arch.fixtures.dirty.app;

import java.util.Random;

/** Fixture: unseeded randomness, which the rules must reject. */
public final class UsesJavaUtilRandom {
    public int roll() {
        return new Random().nextInt(6);
    }
}
