/**
 * Inside this file you will use the classes and functions from rx.js
 * to add visuals to the svg element in index.html, animate them, and make them interactive.
 *
 * Study and complete the tasks in observable exercises first to get ideas.
 *
 * Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/
 *
 * You will be marked on your functional programming style
 * as well as the functionality that you implement.
 *
 * Document your code!
 */

import "./style.css";

import { fromEvent, interval, merge, from, of, zip } from "rxjs";
import {
    map,
    filter,
    scan,
    skip,
    mergeMap,
    delay,
    endWith,
    tap,
    switchMap,
    concatMap,
    withLatestFrom,
} from "rxjs/operators";
import * as Tone from "tone";
import { SampleLibrary } from "./tonejs-instruments";

import { Key, Event, State, Note, Circle } from "./types";
import {
    initialState,
    Tick,
    ProcessNote,
    PressKey,
    End,
    PressWrong,
} from "./state";
import {
    Constants,
    createRngStreamFromSource,
    playRandom,
    reduceState,
} from "./util";
import { updateView } from "./view";

/**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @returns Updated state
 */
const tick = (s: State) => s;

/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main(
    csvContents: string,
    samples: { [key: string]: Tone.Sampler },
) {
    /** User input */
    const key$ = fromEvent<KeyboardEvent>(document, "keypress");

    const fromKey = (keyCode: Key) =>
        key$.pipe(filter(({ code }) => code === keyCode));

    const readCSV = (csvContents: string) => {
        const contents = csvContents.split("\n");
        return from(contents).pipe(
            skip(1),
            mergeMap((line) => {
                const [
                    user_played,
                    instrument_name,
                    velocity,
                    pitch,
                    start,
                    end,
                ] = line.split(",");
                const note = {
                    user_played: user_played == "True",
                    instrument_name,
                    velocity: Number(velocity),
                    pitch: Number(pitch),
                    start: Number(start),
                    end: Number(end),
                };
                return of(note).pipe(delay(note.start * 1000));
            }),
        );
    };

    /** Determines the rate of time steps */
    const tick$ = interval(Constants.TICK_RATE_MS).pipe(
        map((tick) => new Tick(tick)),
    );

    const notes$ = readCSV(csvContents).pipe(
        map((note) => new ProcessNote(note)),
        endWith(new End()),
    );

    const playKeys: Key[] = ["KeyH", "KeyJ", "KeyK", "KeyL"];

    // const playKeys$ = playKeys.map((key) =>
    //     fromKey(key).pipe(
    //         concatMap((event) => [
    //             new PressKey(event),
    //             new PressWrong(Constants.SEED),
    //         ]),
    //     ),
    // );

    const playKeys$ = playKeys.map((key) =>
        fromKey(key).pipe(map((event) => new PressKey(event))),
    );

    const randomNoteStream$ = createRngStreamFromSource(interval(100))(
        Constants.SEED,
    );

    // const playKeys$ = playKeys.map((key) =>
    //     fromKey(key).pipe(
    //         concatMap((event) => of(new PressKey(event))),
    //         withLatestFrom(randomNoteStream$),
    //         mergeMap(([pressKeyAction, randomNote]) => [
    //             pressKeyAction,
    //             new PressWrong(randomNote),
    //         ]),
    //     ),
    // );

    // const randomNote$ = createRngStreamFromSource(interval(100))(
    //     Date.now(),
    // ).pipe(map((note) => new PressWrong(Constants.SEED)));

    // const randomNote = createRngStreamFromSource(tick$);

    // // Handle wrong notes by playing a random note
    // // const handleWrongNotes$ = randomNote$.pipe(
    // //     tap((randomNote) => playRandom(randomNote, samples)),
    // // );

    // const source$ = merge(tick$, notes$, ...keyObservables$)
    //     .pipe(
    //         scan(reduceState, initialState),
    //         switchMap((s: State) => {
    //             if (s.wrongNote) {
    //                 console.log("Wrong Note", s);
    //                 return handleWrongNotes$.pipe(map(() => s));
    //             }
    //             return of(s);
    //         }),
    //     )
    //     .subscribe((s: State) => {
    //         console.log(s);
    //         updateView(s, samples);
    //     });

    const source$ = merge(tick$, notes$, ...playKeys$)
        .pipe(scan(reduceState, initialState))
        .subscribe((s: State) => {
            console.log(s);
            updateView(s, samples);
        });
}

// The following simply runs your main function on window load.  Make sure to leave it in place.
// You should not need to change this, beware if you are.
if (typeof window !== "undefined") {
    // Load in the instruments and then start your game!
    const samples = SampleLibrary.load({
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
    });

    const startGame = (contents: string) => {
        document.body.addEventListener(
            "mousedown",
            function () {
                main(contents, samples);
            },
            { once: true },
        );
    };

    const { protocol, hostname, port } = new URL(import.meta.url);
    const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ""}`;

    Tone.ToneAudioBuffer.loaded().then(() => {
        for (const instrument in samples) {
            samples[instrument].toDestination();
            samples[instrument].release = 0.5;
        }

        fetch(`${baseUrl}/assets/${Constants.SONG_NAME}.csv`)
            .then((response) => response.text())
            .then((text) => startGame(text))
            .catch((error) =>
                console.error("Error fetching the CSV file:", error),
            );
    });
}
