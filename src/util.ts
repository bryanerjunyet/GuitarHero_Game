import { map, Observable, scan } from "rxjs";
import { SampleLibrary } from "./tonejs-instruments";
import { Action, Note, State } from "./types";
import * as Tone from "tone";

/** Constants */

const Viewport = {
    CANVAS_WIDTH: 200,
    CANVAS_HEIGHT: 400,
} as const;

const Constants = {
    TICK_RATE_MS: 10,
    SONG_NAME: "RockinRobin",
    SEED: 123,

    RADIUS: String(0.07 * Viewport.CANVAS_WIDTH),
    TAIL_WIDTH: 10,

    GREEN_CX: ["20%", "fill: green"],
    RED_CX: ["40%", "fill: red"],
    BLUE_CX: ["60%", "fill: blue"],
    YELLOW_CX: ["80%", "fill: yellow"],

    CY: "350",
    CIRCLE_CLASS: "shadow",
    SAMPLES: SampleLibrary.load({
        instruments: [
            "bass-electric",
            "violin",
            "piano",
            "trumpet",
            "saxophone",
            "trombone",
            "flute",
        ], // SampleLibrary.list,
        baseUrl: "samples/",
    }),
} as const;

/** Utility functions */
const not =
    <T>(f: (x: T) => boolean) =>
    (x: T) =>
        !f(x);

const reduceState = (s: State, action: Action) => {
    return action.apply(s);
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

    // /**
    //  * Scales the hash value to the range [min, max]
    //  * @param hash The hash value to scale
    //  * @param min The minimum value of the desired range
    //  * @param max The maximum value of the desired range
    //  * @returns A value scaled to the range [min, max]
    //  */
    // public static scale = (hash: number, min: number, max: number) => {
    //     // Scale hash to the range [0, 1]
    //     const scaled = (hash % (RNG.m - 1)) / (RNG.m - 1);
    //     // Scale to the desired range [min, max]
    //     return min + scaled * (max - min);
    // };
}

const getRandomNote = (seed: number = Constants.SEED): Note => {
    const instruments = [
        "bass-electric",
        "violin",
        "piano",
        "trumpet",
        "saxophone",
        "trombone",
        "flute",
    ];

    // Generate random hash values
    const hash1 = RNG.hash(seed);
    const hash2 = RNG.hash(hash1);
    const hash3 = RNG.hash(hash2);
    const hash4 = RNG.hash(hash3);
    const hash5 = RNG.hash(hash4);
    // const hash6 = RNG.hash(hash5);

    // Randomly determine if the note is user-played
    const user_played = hash1 % 2 === 0; // 50% chance to be true or false

    // Randomly choose an instrument from the list
    const instrument_name =
        instruments[Math.floor(RNG.scale(hash2, 0, instruments.length))];

    // Randomly generate pitch between MIDI 21 (A0) and 108 (C8)
    const pitch = Math.floor(RNG.scale(hash3, 21, 108));

    // Randomly generate velocity in the range 0 to 1
    const velocity = RNG.scale(hash4, 0, 1);

    const start = 0;
    const end = RNG.scale(hash5, 0, 0.5);
    // Randomly generate start and end times (e.g., 0 to 0.5 seconds)
    // const duration = RNG.scale(hash5, 0, 0.5);

    return {
        user_played,
        instrument_name,
        velocity,
        pitch,
        start,
        end,
    };
};

function generateRandomNote(seed: number): Note {
    const instruments = [
        "bass-electric",
        "violin",
        "piano",
        "trumpet",
        "saxophone",
        "trombone",
        "flute",
    ];
    const minVelocity = 0,
        maxVelocity = 1;
    const minPitch = 21,
        maxPitch = 108; // Randomly generate pitch between MIDI 21 (A0) and 108 (C8)
    const minDuration = 0,
        maxDuration = 0.5;

    // Generate random values for each property
    const instrument_name = "piano";
    // instruments[
    //     Math.floor(RNG.scale(RNG.hash(seed), 0, instruments.length))
    // ];
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
}

/**
 * Converts values in a stream to random notes using a seed for RNG.
 *
 * @param source$ The source Observable, elements of this are replaced with random notes
 * @param seed The seed for the random number generator
 */
export function createRngStreamFromSource<T>(source$: Observable<T>) {
    return function createRngStream(seed: number = 0): Observable<Note> {
        return source$.pipe(
            // Emit accumulated state (seed) using RNG.hash
            scan((currentSeed) => RNG.hash(currentSeed), seed),
            // Generate a random note for each seed value
            map((seed) => generateRandomNote(seed)),
        );
    };
}

const playRandom = (note: Note, samples: { [key: string]: Tone.Sampler }) => {
    console.log("Got Play", note);
    samples[note.instrument_name].triggerAttackRelease(
        Tone.Frequency(note.pitch, "midi").toNote(),
        0.5,
        undefined,
        note.velocity / 10,
    );
    // samples["piano"].triggerRelease(note.instrument_name);
};

export {
    not,
    reduceState,
    getRandomNote,
    playRandom,
    generateRandomNote,
    Constants,
    Viewport,
};
