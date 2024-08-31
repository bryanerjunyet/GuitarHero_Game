import { SampleLibrary } from "./tonejs-instruments";
import { Action, Key, Note, State } from "./types";

/** Constants */
class PlayKeys {
    static readonly PLAY_KEYS: Key[] = ["KeyH", "KeyJ", "KeyK", "KeyL"];
}

const Viewport = {
    CANVAS_WIDTH: 200,
    CANVAS_HEIGHT: 400,
} as const;

const Property = {
    GREEN_POINT: ["20%", "fill: green"],
    RED_POINT: ["40%", "fill: red"],
    BLUE_POINT: ["60%", "fill: blue"],
    YELLOW_POINT: ["80%", "fill: yellow"],

    CIRCLE_CLASS: "shadow",
    BASE_POINT: "350",
    RADIUS: String(0.07 * Viewport.CANVAS_WIDTH),
} as const;

const Song = {
    SONG_NAME: "RockinRobin",
    TICK_RATE_MS: 10,
} as const;

/** Utility functions */
const not =
    <T>(f: (x: T) => boolean) =>
    (x: T) =>
        !f(x);

const reduceState = (s: State, action: Action) => {
    return action.apply(s);
};

const getRandomNote = (seed: number): Note => {
    const minVelocity = 0,
        maxVelocity = 1;
    const minPitch = 21,
        maxPitch = 108; // Randomly generate pitch between MIDI 21 (A0) and 108 (C8)
    const minDuration = 0,
        maxDuration = 0.5;

    // Generate random values for each property
    const instrument_name = "piano";
    const velocity = RNG.scale(RNG.hash(seed + 1), minVelocity, maxVelocity);
    const pitch = Math.floor(RNG.scale(RNG.hash(seed + 2), minPitch, maxPitch));
    const start = 0;
    const end = RNG.scale(RNG.hash(seed + 3), minDuration, maxDuration);

    return {
        user_played: false,
        instrument_name,
        velocity: velocity * 300,
        pitch,
        start,
        end,
    };
};

/**
 * A random number generator which provides two pure functions
 * `hash` and `scaleToRange`.  Call `hash` repeatedly to generate the
 * sequence of hashes.
 */
abstract class RNG {
    // LCG using GCC's constants
    private static m = 0x80000000; // 2**31
    private static a = 1103515245;
    private static c = 12345;

    /**
     * Call `hash` repeatedly to generate the sequence of hashes.
     * @param seed
     * @returns a hash of the seed
     */
    public static hash = (seed: number) => (RNG.a * seed + RNG.c) % RNG.m;

    /**
     * Scales the hash value to a given range [min, max].
     * @param hash The hashed value to scale.
     * @param min The minimum value of the desired range.
     * @param max The maximum value of the desired range.
     * @returns A scaled value within the range [min, max].
     */
    public static scale(hash: number, min: number, max: number): number {
        return min + (hash / (RNG.m - 1)) * (max - min);
    }
}

export { not, reduceState, getRandomNote, PlayKeys, Viewport, Property, Song };
