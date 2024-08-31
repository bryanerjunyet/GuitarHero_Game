/**
 * This util.ts file provides utility functions and constants used throughout the Guitar Hero-like game.
 * The file includes functionality for random note generation, state reduction,
 * and key operators for game control. Additionally, it defines constants
 * related to the game viewport, note properties, and song configuration.
 *
 * Key functionalities include:
 * 1. Constants defining key bindings and view-related properties.
 * 2. A random number generator utility class with methods for hashing and scaling values.
 * 3. A state reduction function that applies actions to the game state.
 * 4. A function to generate random musical notes for the game.
 */
import { Action, Key, Note, State } from "./types";

/**
 * Constants representing the keys that can be pressed to play notes in the game.
 * These keys are bound to specific actions in the game.
 */
class PlayKeys {
    static readonly PLAY_KEYS: Key[] = ["KeyH", "KeyJ", "KeyK", "KeyL"];
}

/**
 * Constants representing the dimensions of the game viewport (canvas).
 * These values are used to define the width and height of the game's visual elements.
 */
const Viewport = {
    CANVAS_WIDTH: 200,
    CANVAS_HEIGHT: 400,
} as const;

/**
 * Constants representing various properties of the visual elements (e.g., circles) in the game.
 * These properties define the positions, colors, and other visual aspects of the notes displayed on the screen.
 */
const Property = {
    GREEN_POINT: ["20%", "fill: green"],
    RED_POINT: ["40%", "fill: red"],
    BLUE_POINT: ["60%", "fill: blue"],
    YELLOW_POINT: ["80%", "fill: yellow"],
    CIRCLE_CLASS: "shadow",
    BASE_POINT: "350",
    RADIUS: String(0.07 * Viewport.CANVAS_WIDTH),
} as const;

/**
 * Constants related to the song being played in the game.
 * This includes the song name and the tick rate (the interval at which the game updates).
 */
const Song = {
    SONG_NAME: "RockinRobin",
    TICK_RATE_MS: 10,
} as const;

/**
 * A utility function that negates the result of a given predicate function.
 *
 * @param f - A predicate function that takes a value of type T and returns a boolean.
 * @returns A function that takes a value of type T and returns the negation of the predicate's result.
 */
const not =
    <T>(f: (x: T) => boolean) =>
    (x: T) =>
        !f(x);

/**
 * A reducer function that updates the game state based on the given action.
 * This function applies the action to the current state and returns the new state.
 *
 * @param s - The current state of the game.
 * @param action - The action to apply to the state.
 * @returns The updated state after the action has been applied.
 */
const reduceState = (s: State, action: Action) => {
    return action.apply(s);
};

/**
 * A function that generates a random musical note using a seed value.
 * The note includes a random velocity, pitch, and duration, all within specified ranges.
 *
 * @param seed - A seed value used for generating the random note.
 * @returns A randomly generated Note object with specified properties.
 */
const getRandomNote = (seed: number): Note => {
    //random velocity between 0 and 1
    const minVelocity = 0,
        maxVelocity = 1;
    //random pitch between MIDI 21 (A0) and 108 (C8)
    const minPitch = 21,
        maxPitch = 108;
    //random duration between 0 and 0.5 seconds
    const minDuration = 0,
        maxDuration = 0.5;

    const hash1 = RNG.hash(seed);
    const hash2 = RNG.hash(hash1);
    const hash3 = RNG.hash(hash2);

    //generate random values for each property
    const instrument_name = "piano";
    const velocity = RNG.scale(hash1, minVelocity, maxVelocity);
    const pitch = Math.floor(RNG.scale(hash2, minPitch, maxPitch));
    const start = 0;
    const end = RNG.scale(hash3, minDuration, maxDuration);

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
 * hash and scale. Call hash repeatedly to generate the
 * sequence of hashes.
 */
abstract class RNG {
    // LCG using GCC's constants
    private static m = 0x80000000; // 2**31
    private static a = 1103515245;
    private static c = 12345;

    /**
     * Call hash repeatedly to generate the sequence of hashes.
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
