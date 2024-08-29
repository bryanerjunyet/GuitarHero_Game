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

import { fromEvent, interval, merge, from, of } from "rxjs";
import { map, filter, scan, skip, mergeMap, delay } from "rxjs/operators";
import * as Tone from "tone";
import { SampleLibrary } from "./tonejs-instruments";

import { Key, Event, State, Note, Circle } from "./types";
import { initialState, Tick, ProcessNote, PressKey } from "./state";
import { Constants, reduceState } from "./util";
import { updateView } from "./view";

/**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @returns Updated state
 */
const tick = (s: State) => s;

// /**
//  * Displays a SVG element on the canvas. Brings to foreground.
//  * @param elem SVG element to display
//  */
// const show = (elem: SVGGraphicsElement) => {
//     elem.setAttribute("visibility", "visible");
//     elem.parentNode!.appendChild(elem);
// };

// /**
//  * Hides a SVG element on the canvas.
//  * @param elem SVG element to hide
//  */
// const hide = (elem: SVGGraphicsElement) =>
//     elem.setAttribute("visibility", "hidden");

// /**
//  * Creates an SVG element with the given properties.
//  *
//  * See https://developer.mozilla.org/en-US/docs/Web/SVG/Element for valid
//  * element names and properties.
//  *
//  * @param namespace Namespace of the SVG element
//  * @param name SVGElement name
//  * @param props Properties to set on the SVG element
//  * @returns SVG element
//  */
// const createSvgElement = (
//     namespace: string | null,
//     name: string,
//     props: Record<string, string> = {},
// ) => {
//     const elem = document.createElementNS(namespace, name) as SVGElement;
//     Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
//     return elem;
// };

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
    );

    const keyH$ = fromKey("KeyH").pipe(map((event) => new PressKey(event)));
    const keyJ$ = fromKey("KeyJ").pipe(map((event) => new PressKey(event)));
    const keyK$ = fromKey("KeyK").pipe(map((event) => new PressKey(event)));
    const keyL$ = fromKey("KeyL").pipe(map((event) => new PressKey(event)));

    const source$ = merge(tick$, notes$, keyH$, keyJ$, keyK$, keyL$)
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
