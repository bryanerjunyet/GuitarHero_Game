/**
 * This main.ts file is the entry point of a Guitar Hero-like game implemented using Functional Reactive Programming (FRP) principles with RxJS and Tone.js.
 *
 * The game reads musical note data from a CSV file and uses this data to play corresponding musical notes while updating the game state in real time.
 * Players interact with the game by pressing keys on the keyboard that match the notes being played. The game loop is driven by an interval-based tick system and
 * the state of the game is managed using RxJS observables, which react to various events such as key presses, note timings, and the end of the song.
 *
 * Key functionalities include:
 * 1. Reading and parsing CSV data to create note events.
 * 2. Listening for keyboard events to capture player input.
 * 3. Merging these events and driving the game state updates in a reactive manner.
 * 4. Rendering the game's visuals and handling note playback using the Tone.js library.
 * 5. Managing game states, such as tracking which notes have been played, handling the game's progression, and determining when the game is over.
 *
 * The code emphasizes a functional programming approach by utilizing RxJS streams to manage asynchronous events and states without relying on mutable state.
 */
import "./style.css";

import { fromEvent, interval, merge, from, of } from "rxjs";
import {
    map,
    filter,
    scan,
    skip,
    mergeMap,
    delay,
    endWith,
} from "rxjs/operators";
import * as Tone from "tone";
import { SampleLibrary } from "./tonejs-instruments";

import { Key, State } from "./types";
import { initialState, Tick, PlayNote, PressKey, EndNote } from "./state";
import { PlayKeys, Song, reduceState } from "./util";
import { updateView } from "./view";

/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 *
 * @param {string} csvContents - The contents of the CSV file as a string.
 * @param {{[key: string]: Tone.Sampler}} samples - An object containing Tone.Sampler instances keyed by instrument name.
 */
export function main(
    csvContents: string,
    samples: { [key: string]: Tone.Sampler },
) {
    /**
     * Observable of key presses
     */
    const key$ = fromEvent<KeyboardEvent>(document, "keypress");

    /**
     * Filters keyboard events to those matching a specific key code.
     *
     * @param {Key} keyCode - The code of the key to filter for.
     * @returns {Observable<KeyboardEvent>} - An observable that emits events when the specified key is pressed.
     */
    const fromKey = (keyCode: Key) =>
        key$.pipe(filter(({ code }) => code === keyCode));

    /**
     * Parses the CSV file content into individual notes and emits them as observables.
     *
     * @param {string} csvContents - The contents of the CSV file as a string.
     * @returns {Observable<Object>} - An observable that emits note objects after a delay based on their start time.
     */
    const readCSV = (csvContents: string) => {
        const contents = csvContents.split("\n");
        return from(contents).pipe(
            skip(1), //skip header
            mergeMap((line) => {
                const [
                    user_played,
                    instrument_name,
                    velocity,
                    pitch,
                    start,
                    end,
                ] = line.split(",");
                //create note object with info from csv
                const note = {
                    user_played: user_played == "True",
                    instrument_name,
                    velocity: Number(velocity),
                    pitch: Number(pitch),
                    start: Number(start),
                    end: Number(end),
                };
                //emit note object with delay
                return of(note).pipe(delay(note.start * 1000));
            }),
        );
    };

    /**
     * Observable that emits tick events at regular intervals.
     * This drives the main loop of the game.
     */
    const tick$ = interval(Song.TICK_RATE_MS).pipe(
        map((tick) => new Tick(tick)),
    );

    /**
     * Observable that emits note-playing actions based on the parsed CSV data.
     * It ends with an End action to signify the end of the song.
     */
    const notes$ = readCSV(csvContents).pipe(
        //each note is playable
        map((note) => new PlayNote(note)),
        //last note end to have game over
        endWith(new EndNote()),
    );

    /**
     * Array of observables, each emitting a PressKey action when the corresponding key is pressed.
     */
    const playKeys$ = PlayKeys.PLAY_KEYS.map((key) =>
        //each key played result an event action
        fromKey(key).pipe(map((event) => new PressKey(event))),
    );

    /**
     * Merges the tick, note and key press observables into a single stream.
     * The stream is scanned to produce the game's state, which is then passed to the updateView function.
     */
    const source$ = merge(tick$, notes$, ...playKeys$) //merge all observables into single observable
        //emits accumulated state after each emission
        .pipe(scan(reduceState, initialState))
        //execute Observable by handling emitted value in updateView with the State
        .subscribe((s: State) => {
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

        fetch(`${baseUrl}/assets/${Song.SONG_NAME}.csv`)
            .then((response) => response.text())
            .then((text) => startGame(text))
            .catch((error) =>
                console.error("Error fetching the CSV file:", error),
            );
    });
}
