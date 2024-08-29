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
import { reduceState } from "./util";

/** Constants */

const Viewport = {
    CANVAS_WIDTH: 200,
    CANVAS_HEIGHT: 400,
} as const;

export const Constants = {
    TICK_RATE_MS: 10,
    SONG_NAME: "RockinRobin",

    RADIUS: String(0.07 * Viewport.CANVAS_WIDTH),
    TAIL_WIDTH: 10,

    GREEN_CX: ["20%", "fill: green"],
    RED_CX: ["40%", "fill: red"],
    BLUE_CX: ["60%", "fill: blue"],
    YELLOW_CX: ["80%", "fill: yellow"],

    CY: "350",
    CIRCLE_CLASS: "shadow",
} as const;

/**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @returns Updated state
 */
const tick = (s: State) => s;

/**
 * Displays a SVG element on the canvas. Brings to foreground.
 * @param elem SVG element to display
 */
const show = (elem: SVGGraphicsElement) => {
    elem.setAttribute("visibility", "visible");
    elem.parentNode!.appendChild(elem);
};

/**
 * Hides a SVG element on the canvas.
 * @param elem SVG element to hide
 */
const hide = (elem: SVGGraphicsElement) =>
    elem.setAttribute("visibility", "hidden");

/**
 * Creates an SVG element with the given properties.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/SVG/Element for valid
 * element names and properties.
 *
 * @param namespace Namespace of the SVG element
 * @param name SVGElement name
 * @param props Properties to set on the SVG element
 * @returns SVG element
 */
const createSvgElement = (
    namespace: string | null,
    name: string,
    props: Record<string, string> = {},
) => {
    const elem = document.createElementNS(namespace, name) as SVGElement;
    Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
    return elem;
};

/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main(
    csvContents: string,
    samples: { [key: string]: Tone.Sampler },
) {
    // Canvas elements
    const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
        HTMLElement;
    const preview = document.querySelector(
        "#svgPreview",
    ) as SVGGraphicsElement & HTMLElement;
    const gameover = document.querySelector("#gameOver") as SVGGraphicsElement &
        HTMLElement;
    const container = document.querySelector("#main") as HTMLElement;

    svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
    svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);

    // Text fields
    const multiplier = document.querySelector("#multiplierText") as HTMLElement;
    const scoreText = document.querySelector("#scoreText") as HTMLElement;
    const highScoreText = document.querySelector(
        "#highScoreText",
    ) as HTMLElement;

    /** User input */

    const key$ = fromEvent<KeyboardEvent>(document, "keypress");

    const fromKey = (keyCode: Key) =>
        key$.pipe(filter(({ code }) => code === keyCode));

    /**
     * Renders the current state to the canvas.
     *
     * In MVC terms, this updates the View using the Model.
     */
    const render = (renderCircles: ReadonlyArray<Circle>) => {
        // Add blocks to the main grid canvas
        const createElement = (circle: Circle) => {
            const circleElement = createSvgElement(svg.namespaceURI, "circle", {
                id: circle.id,
                r: circle.r,
                cx: circle.cx,
                cy: circle.cy,
                style: circle.style,
                class: circle.class,
            });
            svg.appendChild(circleElement);
            return circleElement;
        };

        renderCircles.forEach((circle) => {
            const circleElement =
                document.getElementById(circle.id) || createElement(circle);
            circleElement.setAttribute("cy", circle.cy);
        });
    };

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

    const play = (playNotes: ReadonlyArray<Note>) => {
        playNotes.forEach((note) => {
            samples[note.instrument_name].triggerAttackRelease(
                Tone.Frequency(note.pitch, "midi").toNote(),
                note.end - note.start,
                undefined,
                note.velocity / 300,
            );
        });
    };

    const remove = (removeCircles: ReadonlyArray<Circle>) => {
        removeCircles.forEach((circle) => {
            const circleElement = document.getElementById(circle.id)!;
            svg.removeChild(circleElement);
        });
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
            render(s.renderCircles);
            play(s.playNotes);
            remove(s.removeCircles);
            scoreText.textContent = String(s.score);

            if (s.gameEnd) {
                show(gameover);
            } else {
                hide(gameover);
            }
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
