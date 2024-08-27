// /**
//  * Inside this file you will use the classes and functions from rx.js
//  * to add visuals to the svg element in index.html, animate them, and make them interactive.
//  *
//  * Study and complete the tasks in observable exercises first to get ideas.
//  *
//  * Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/
//  *
//  * You will be marked on your functional programming style
//  * as well as the functionality that you implement.
//  *
//  * Document your code!
//  */

// import "./style.css";

// import { fromEvent, interval, merge } from "rxjs";
// import { map, filter, scan } from "rxjs/operators";
// import * as Tone from "tone";
// import { SampleLibrary } from "./tonejs-instruments";

// /** Constants */

// const Viewport = {
//     CANVAS_WIDTH: 200,
//     CANVAS_HEIGHT: 400,
// } as const;

// const Constants = {
//     TICK_RATE_MS: 500,
//     SONG_NAME: "RockinRobin",
// } as const;

// const Note = {
//     RADIUS: 0.07 * Viewport.CANVAS_WIDTH,
//     TAIL_WIDTH: 10,
// };

// /** User input */

// type Key = "KeyH" | "KeyJ" | "KeyK" | "KeyL";

// type Event = "keydown" | "keyup" | "keypress";

// /** Utility functions */

// /** State processing */

// type State = Readonly<{
//     gameEnd: boolean;
// }>;

// const initialState: State = {
//     gameEnd: false,
// } as const;

// /**
//  * Updates the state by proceeding with one time step.
//  *
//  * @param s Current state
//  * @returns Updated state
//  */
// const tick = (s: State) => s;

// /** Rendering (side effects) */

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

// /**
//  * This is the function called on page load. Your main game loop
//  * should be called here.
//  */
// export function main(csvContents: string, samples: { [key: string]: Tone.Sampler }) {
//     // Canvas elements
//     const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
//         HTMLElement;
//     const preview = document.querySelector(
//         "#svgPreview",
//     ) as SVGGraphicsElement & HTMLElement;
//     const gameover = document.querySelector("#gameOver") as SVGGraphicsElement &
//         HTMLElement;
//     const container = document.querySelector("#main") as HTMLElement;

//     svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
//     svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);

//     // Text fields
//     const multiplier = document.querySelector("#multiplierText") as HTMLElement;
//     const scoreText = document.querySelector("#scoreText") as HTMLElement;
//     const highScoreText = document.querySelector(
//         "#highScoreText",
//     ) as HTMLElement;

//     /** User input */

//     const key$ = fromEvent<KeyboardEvent>(document, "keypress");

//     const fromKey = (keyCode: Key) =>
//         key$.pipe(filter(({ code }) => code === keyCode));

//     /** Determines the rate of time steps */
//     const tick$ = interval(Constants.TICK_RATE_MS);

//     /**
//      * Renders the current state to the canvas.
//      *
//      * In MVC terms, this updates the View using the Model.
//      *
//      * @param s Current state
//      */
//     const render = (s: State) => {
//         // Add blocks to the main grid canvas
//         const greenCircle = createSvgElement(svg.namespaceURI, "circle", {
//             r: `${Note.RADIUS}`,
//             cx: "20%",
//             cy: "200",
//             style: "fill: green",
//             class: "shadow",
//         });

//         const redCircle = createSvgElement(svg.namespaceURI, "circle", {
//             r: `${Note.RADIUS}`,
//             cx: "40%",
//             cy: "50",
//             style: "fill: red",
//             class: "shadow",
//         });

//         const blueCircle = createSvgElement(svg.namespaceURI, "circle", {
//             r: `${Note.RADIUS}`,
//             cx: "60%",
//             cy: "50",
//             style: "fill: blue",
//             class: "shadow",
//         });

//         const yellowCircle = createSvgElement(svg.namespaceURI, "circle", {
//             r: `${Note.RADIUS}`,
//             cx: "80%",
//             cy: "50",
//             style: "fill: yellow",
//             class: "shadow",
//         });

//         svg.appendChild(greenCircle);
//         svg.appendChild(redCircle);
//         svg.appendChild(blueCircle);
//         svg.appendChild(yellowCircle);
//     };

//     const source$ = tick$
//         .pipe(scan((s: State) => ({ gameEnd: false }), initialState))
//         .subscribe((s: State) => {
//             render(s);

//             if (s.gameEnd) {
//                 show(gameover);
//             } else {
//                 hide(gameover);
//             }
//         });
// }

// // The following simply runs your main function on window load.  Make sure to leave it in place.
// // You should not need to change this, beware if you are.
// if (typeof window !== "undefined") {
//     // Load in the instruments and then start your game!
//     const samples = SampleLibrary.load({
//         instruments: [
//             "bass-electric",
//             "violin",
//             "piano",
//             "trumpet",
//             "saxophone",
//             "trombone",
//             "flute",
//         ], // SampleLibrary.list,
//         baseUrl: "samples/",
//     });

//     const startGame = (contents: string) => {
//         document.body.addEventListener(
//             "mousedown",
//             function () {
//                 main(contents, samples);
//             },
//             { once: true },
//         );
//     };

//     const { protocol, hostname, port } = new URL(import.meta.url);
//     const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ""}`;

//     Tone.ToneAudioBuffer.loaded().then(() => {
//         for (const instrument in samples) {
//             samples[instrument].toDestination();
//             samples[instrument].release = 0.5;
//         }

//         fetch(`${baseUrl}/assets/${Constants.SONG_NAME}.csv`)
//             .then((response) => response.text())
//             .then((text) => startGame(text))
//             .catch((error) =>
//                 console.error("Error fetching the CSV file:", error),
//             );

//     });
// }

// // main.ts
// import { fromEvent, interval } from "rxjs";
// import { map, filter, scan, takeWhile } from "rxjs/operators";
// import { initialState, tick, updateScore, addNote, endGame } from "./state";
// import { render } from "./view";
// import { createNote } from "./util";
// import { Key, Note, State } from "./types";

// const Constants = {
//     TICK_RATE_MS: 16,
// };

// export function main(
//     csvContents: string,
//     samples: { [key: string]: Tone.Sampler },
// ) {
//     const svg = document.querySelector("#svgCanvas") as SVGSVGElement;

//     // Parse CSV to create notes
//     const notes = parseCSV(csvContents);

//     const key$ = fromEvent<KeyboardEvent>(document, "keypress");

//     const tick$ = interval(Constants.TICK_RATE_MS).pipe(
//         scan((s: State, elapsed: number) => {
//             const updatedState = tick(s, elapsed);

//             // Add notes to the state at the correct time
//             notes.forEach((note) => {
//                 if (note.startTime <= elapsed && note.endTime >= elapsed) {
//                     updatedState.notes.push(note);
//                 }
//             });

//             return updatedState;
//         }, initialState),
//     );

//     tick$
//         .pipe(
//             takeWhile((s) => !s.gameEnd), // End the stream when the game ends
//         )
//         .subscribe((s) => {
//             render(s, svg);
//             if (s.gameEnd) {
//                 endGame(s); // Additional game end logic, if necessary
//             }
//         });

//     // Handle key presses
//     key$.pipe(
//         filter(
//             (event) =>
//                 event.code === "KeyH" ||
//                 event.code === "KeyJ" ||
//                 event.code === "KeyK" ||
//                 event.code === "KeyL",
//         ),
//         map((event) => {
//             // Logic to check if a note is correctly hit
//             const hitNote = checkNoteHit(event.code, initialState.notes);
//             if (hitNote) {
//                 samples[hitNote.instrumentName].triggerAttackRelease(
//                     hitNote.pitch,
//                     "8n",
//                 ); // Play the note
//                 return 10; // Assume 10 points for correct hit
//             }
//             return 0;
//         }),
//     ).subscribe((points) => {
//         if (points > 0) {
//             initialState = updateScore(initialState, points); // Update score
//         }
//     });
// }

// function parseCSV(csvContents: string): Note[] {
//     const lines = csvContents.split("\n");
//     return lines.map((line, index) => {
//         const [startTime, endTime, column, instrumentName, pitch, velocity] =
//             line.split(",");
//         return createNote(
//             index,
//             parseInt(column, 10),
//             false, // userPlayed is false initially
//             instrumentName,
//             parseInt(velocity, 10),
//             parseInt(pitch, 10),
//             parseInt(startTime, 10),
//             parseInt(endTime, 10),
//         );
//     });
// }

// function checkNoteHit(key: string, notes: Note[]): Note | null {
//     // Logic to determine if a key press corresponds to a note hit
//     const hitNote = notes.find((note) => {
//         // Logic to check if the note is in the right position
//         return (
//             note.column === getColumnFromKey(key) &&
//             note.y > 380 &&
//             note.y < 420
//         );
//     });

//     if (hitNote) {
//         hitNote.userPlayed = true;
//         return hitNote;
//     }

//     return null;
// }

// function getColumnFromKey(key: string): number {
//     switch (key) {
//         case "KeyH":
//             return 0;
//         case "KeyJ":
//             return 1;
//         case "KeyK":
//             return 2;
//         case "KeyL":
//             return 3;
//         default:
//             return -1;
//     }
// }

// import { fromEvent, interval } from "rxjs";
// import { map, filter, scan } from "rxjs/operators";
// import { initialState, tick, updateScore, addNote, endGame } from "./state";
// import { render } from "./view";
// import { createNote } from "./util";
// import { Key, Note, State } from "./types";

// const Constants = {
//     TICK_RATE_MS: 16,
// };

// export function main(
//     csvContents: string,
//     samples: { [key: string]: Tone.Sampler },
// ) {
//     const svg = document.querySelector("#svgCanvas") as SVGSVGElement;

//     const key$ = fromEvent<KeyboardEvent>(document, "keypress");

//     const tick$ = interval(Constants.TICK_RATE_MS).pipe(
//         scan((s: State, elapsed: number) => tick(s, elapsed), initialState),
//     );

//     tick$.subscribe((s) => {
//         render(s, svg);
//         if (s.gameEnd) {
//             endGame(s);
//         }
//     });

//     // Handle key presses
//     key$.pipe(
//         filter(
//             (event) =>
//                 event.code === "KeyH" ||
//                 event.code === "KeyJ" ||
//                 event.code === "KeyK" ||
//                 event.code === "KeyL",
//         ),
//         map((event) => {
//             const key: Key = event.code.replace("Key", "") as Key;
//             const noteHit = s.notes.find(
//                 (note) => note.key === key && note.isActive,
//             );
//             return noteHit ? 10 : 0; // Assume 10 points for correct hit
//         }),
//     ).subscribe((points) => {
//         updateScore(initialState, points);
//     });

//     // Logic to parse CSV and add notes to the game state
//     const notes: Note[] = csvContents
//         .split("\n")
//         .map((line) => createNote(line));
//     notes.forEach((note) => addNote(initialState, note));
// }

// import { fromEvent, interval } from "rxjs";
// import { map, filter, scan, takeUntil } from "rxjs/operators";
// import { mainView, renderCircles, show, hide } from "./view";
// import { initialState, tick, State } from "./state";
// import { Key, Note, Constants } from "./types";
// import { createSvgElement } from "./util";
// import * as Tone from "tone";
// import { SampleLibrary } from "./tonejs-instruments";

// export function main(
//     csvContents: string,
//     samples: { [key: string]: Tone.Sampler },
// ) {
//     const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
//         HTMLElement;
//     const gameover = document.querySelector("#gameOver") as SVGGraphicsElement &
//         HTMLElement;

//     mainView(svg);

//     const key$ = fromEvent<KeyboardEvent>(document, "keypress");
//     const tick$ = interval(Constants.TICK_RATE_MS);

//     const fromKey = (keyCode: Key) =>
//         key$.pipe(filter(({ code }) => code === keyCode));

//     const game$ = tick$.pipe(
//         scan(tick, initialState),
//         takeUntil(
//             fromEvent(document, "keydown").pipe(
//                 filter(({ code }) => code === "Escape"),
//             ),
//         ),
//     );

//     game$.subscribe((state: State) => {
//         renderCircles(svg, state);
//         if (state.gameEnd) {
//             show(gameover);
//         } else {
//             hide(gameover);
//         }
//     });
// }

// if (typeof window !== "undefined") {
//     const samples = SampleLibrary.load({
//         instruments: [
//             "bass-electric",
//             "violin",
//             "piano",
//             "trumpet",
//             "saxophone",
//             "trombone",
//             "flute",
//         ],
//         baseUrl: "samples/",
//     });

//     const startGame = (contents: string) => {
//         document.body.addEventListener(
//             "mousedown",
//             function () {
//                 main(contents, samples);
//             },
//             { once: true },
//         );
//     };

//     Tone.ToneAudioBuffer.loaded().then(() => {
//         for (const instrument in samples) {
//             samples[instrument].toDestination();
//             samples[instrument].release = 0.5;
//         }

//         fetch(`assets/${Constants.SONG_NAME}.csv`)
//             .then((response) => response.text())
//             .then((text) => startGame(text))
//             .catch((error) =>
//                 console.error("Error fetching the CSV file:", error),
//             );
//     });
// }

///////WORKING//////

// import "./style.css";
// import { fromEvent, interval, merge } from "rxjs";
// import { map, filter, scan } from "rxjs/operators";
// import * as Tone from "tone";
// import { SampleLibrary } from "./tonejs-instruments";

// /** Constants */

// const Viewport = {
//     CANVAS_WIDTH: 200,
//     CANVAS_HEIGHT: 400,
// } as const;

// const Constants = {
//     TICK_RATE_MS: 500,
//     SONG_NAME: "RockinRobin",
// } as const;

// const Note = {
//     RADIUS: 0.07 * Viewport.CANVAS_WIDTH,
//     TAIL_WIDTH: 10,
// };

// /** Types */

// type Key = "KeyH" | "KeyJ" | "KeyK" | "KeyL";

// type Event = "keydown" | "keyup" | "keypress";

// type State = Readonly<{
//     gameEnd: boolean;
//     score: number;
//     multiplier: number;
//     streak: number;
//     notes: NoteState[];
// }>;

// type NoteState = Readonly<{
//     x: number;
//     y: number;
//     pitch: number;
//     velocity: number;
//     instrument: string;
//     active: boolean;
//     userPlayed: boolean;
//     startTime: number;
//     endTime: number;
// }>;

// const initialState: State = {
//     gameEnd: false,
//     score: 0,
//     multiplier: 1,
//     streak: 0,
//     notes: [],
// } as const;

// /** Utility functions */

// /**
//  * Creates an SVG element with the given properties.
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
//  * Plays a musical note using Tone.js.
//  * @param samples Tone.js samples
//  * @param instrument Instrument name
//  * @param pitch MIDI pitch
//  * @param duration Note duration
//  * @param velocity Volume
//  */
// const playNote = (
//     samples: { [key: string]: Tone.Sampler },
//     instrument: string,
//     pitch: number,
//     duration: number,
//     velocity: number,
// ) => {
//     samples[instrument].triggerAttackRelease(
//         Tone.Frequency(pitch, "midi").toNote(),
//         duration,
//         undefined,
//         velocity,
//     );
// };

// /** State processing */

// /**
//  * Updates the state by proceeding with one time step.
//  * @param s Current state
//  * @returns Updated state
//  */
// const tick = (s: State): State => ({
//     ...s,
//     notes: s.notes.map((note) => ({
//         ...note,
//         y: note.y + 5, // Move note downwards
//         active: note.y + 5 < Viewport.CANVAS_HEIGHT, // Deactivate if off screen
//     })),
// });

// /**
//  * Handles keypresses to play notes.
//  * @param state Current state
//  * @param keyPressed Key pressed by user
//  * @param samples Tone.js samples
//  * @returns Updated state
//  */
// const handleKeyPress = (
//     state: State,
//     keyPressed: string,
//     samples: { [key: string]: Tone.Sampler },
// ): State => {
//     const noteHit = state.notes.find(
//         (note) =>
//             note.userPlayed &&
//             note.active &&
//             note.y >= Viewport.CANVAS_HEIGHT - 50 &&
//             note.y <= Viewport.CANVAS_HEIGHT - 20,
//     );

//     if (noteHit) {
//         playNote(
//             samples,
//             noteHit.instrument,
//             noteHit.pitch,
//             noteHit.endTime - noteHit.startTime,
//             noteHit.velocity,
//         );

//         const newStreak = state.streak + 1;
//         const newMultiplier = Math.min(1 + newStreak * 0.02, 2);

//         return {
//             ...state,
//             score: state.score + 10 * newMultiplier,
//             multiplier: newMultiplier,
//             streak: newStreak,
//             notes: state.notes.map((note) =>
//                 note === noteHit ? { ...note, active: false } : note,
//             ),
//         };
//     } else {
//         // Play randomm(),
//         );
//         return { ...state, streak: 0, multiplier: 1 };
//     }
// };

// /** Rendering (side effects) */

// /**
//  * Renders the current state to the canvas.
//  * @param s Current state
//  */
// const render = (s: State) => {
//     const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
//         HTMLElement;
//     svg.innerHTML = ""; // Clear previous notes

//     s.notes.forEach((note) => {
//         if (note.active) {
//             const circle = createSvgElement(svg.namespaceURI, "circle", {
//                 r: `${Note.RADIUS}`,
//                 cx: `${note.x}`,
//                 cy: `${note.y}`,
//                 style: `fill: ${note.userPlayed ? "green" : "grey"}`,
//             });
//             svg.appendChild(circle);
//         }
//     });

//     // Update score and multiplier displays
//     const scoreText = document.querySelector("#scoreText") as HTMLElement;
//     const multiplierText = document.querySelector(
//         "#multiplierText",
//     ) as HTMLElement;
//     scoreText.textContent = `Score: ${s.score}`;
//     multiplierText.textContent = `Multiplier: x${s.multiplier.toFixed(1)}`;
// };

// /**
//  * This is the function called on page load. Your main game loop
//  * should be called here.
//  */
// export function main(
//     csvContents: string,
//     samples: { [key: string]: Tone.Sampler },
// ) {
//     // Canvas elements
//     const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
//         HTMLElement;
//     const gameover = document.querySelector("#gameOver") as SVGGraphicsElement &
//         HTMLElement;

//     svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
//     svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);

//     // Text fields
//     const scoreText = document.querySelector("#scoreText") as HTMLElement;
//     const multiplierText = document.querySelector(
//         "#multiplierText",
//     ) as HTMLElement;

//     /** User input */
//     const key$ = fromEvent<KeyboardEvent>(document, "keypress");

//     const fromKey = (keyCode: Key) =>
//         key$.pipe(filter(({ code }) => code === keyCode));

//     const tick$ = interval(Constants.TICK_RATE_MS);

//     // Parse CSV contents into notes
//     const notes = csvContents.split("\n").map((line) => {
//         const [userPlayed, instrument, velocity, pitch, start, end] =
//             line.split(",");
//         return {
//             x: Math.random() * Viewport.CANVAS_WIDTH, // Random x position for notes
//             y: 0, // Start at the top of the screen
//             pitch: parseInt(pitch),
//             velocity: parseFloat(velocity) / 127,
//             instrument,
//             active: true,
//             userPlayed: userPlayed === "True",
//             startTime: parseFloat(start),
//             endTime: parseFloat(end),
//         } as NoteState;
//     });

//     const initialStateWithNotes: State = { ...initialState, notes };

//     const game$ = merge(
//         tick$.pipe(map(() => "tick")),
//         key$.pipe(map((e) => e.code)),
//     ).pipe(
//         scan((state: State, event: string) => {
//             if (event === "tick") {
//                 return tick(state);
//             } else {
//                 return handleKeyPress(state, event, samples);
//             }
//         }, initialStateWithNotes),
//     );

//     game$.subscribe((s) => {
//         render(s);
//         if (s.gameEnd) {
//             show(gameover);
//         } else {
//             hide(gameover);
//         }
//     });
// }

// // The following simply runs your main function on window load.  Make sure to leave it in place.
// // You should not need to change this, beware if you are.
// if (typeof window !== "undefined") {
//     // Load in the instruments and then start your game!
//     const samples = SampleLibrary.load({
//         instruments: [
//             "bass-electric",
//             "violin",
//             "piano",
//             "trumpet",
//             "saxophone",
//             "trombone",
//             "flute",
//         ], // SampleLibrary.list,
//         baseUrl: "samples/",
//     });

//     const startGame = (contents: string) => {
//         document.body.addEventListener(
//             "mousedown",
//             function () {
//                 main(contents, samples);
//             },
//             { once: true },
//         );
//     };

//     const { protocol, hostname, port } = new URL(import.meta.url);
//     const baseUrl = `${protocol}//${hostname}${port ? ":" + port : ""}`;

//     Tone.ToneAudioBuffer.loaded().then(() => {
//         for (const instrument in samples) {
//             samples[instrument].toDestination();
//             samples[instrument].release = 0.5;
//         }

//         fetch(`${baseUrl}/assets/${Constants.SONG_NAME}.csv`)
//             .then((response) => response.text())
//             .then((text) => startGame(text))
//             .catch((error) =>
//                 console.error("Error fetching the CSV file:", error),
//             );
//     });
// } note if keypress doesn't align with note
//         playNote(
//             samples,
//             "piano",
//             Math.floor(Math.random() * 88 + 21), // Random pitch between 21 (A0) and 108 (C8)
//             Math.random() * 0.5,
//             Math.rando

/////////////////WORKING NOW HERE///////////////////

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

import { fromEvent, interval, merge, from, of, timer } from "rxjs";
import {
    map,
    filter,
    scan,
    skip,
    mergeMap,
    delay,
    takeUntil,
} from "rxjs/operators";
import * as Tone from "tone";
import { SampleLibrary } from "./tonejs-instruments";
import { doc } from "prettier";

/** Constants */

const Viewport = {
    CANVAS_WIDTH: 200,
    CANVAS_HEIGHT: 400,
} as const;

const Constants = {
    TICK_RATE_MS: 10,
    GREEN_CX: "20%",
    RED_CX: "40%",
    BLUE_CX: "60%",
    YELLOW_CX: "80%",
    CIRCLE_CY: 350,
    SONG_NAME: "RockinRobin",
} as const;

const Note = {
    RADIUS: 0.07 * Viewport.CANVAS_WIDTH,
    TAIL_WIDTH: 10,
};

/** User input */

type Key = "KeyH" | "KeyJ" | "KeyK" | "KeyL";

type Event = "keydown" | "keyup" | "keypress";

/** Utility functions */
const not =
    <T>(f: (x: T) => boolean) =>
    (x: T) =>
        !f(x);
const reduceState = (s: State, action: Action) => {
    // console.log(s)
    return action.apply(s);
};
/** State processing */

// ######################################################################################################################
// Modified
// ######################################################################################################################
type State = Readonly<{
    gameEnd: boolean;
    activeCircles: ReadonlyArray<Circle>;
    expiredCircles: ReadonlyArray<Circle>;
    note: Note | undefined;
    score: number;
    time: number;
    outputBy: string;
    circleCount: number;
    h: boolean;
    j: boolean;
    k: boolean;
    l: boolean;
}>;

const initialState: State = {
    gameEnd: false,
    activeCircles: [],
    expiredCircles: [],
    note: undefined,
    score: 0,
    time: 0,
    outputBy: "tick",
    circleCount: 0,
    h: false,
    j: false,
    k: false,
    l: false,
} as const;

type Note = Readonly<{
    user_played: boolean;
    instrument_name: string;
    velocity: number;
    pitch: number;
    start: number;
    end: number;
}>;

type Circle = Readonly<{
    id: string;
    r: string;
    cx: string;
    cy: string;
    style: string;
    class: string;
}>;

interface Action {
    apply(s: State): State;
}

class Tick implements Action {
    constructor(public readonly time: number) {}

    apply(s: State): State {
        const expired = (circle: Circle) => Number(circle.cy) > 400;
        const expiredCircles = s.activeCircles.filter(expired);
        const activeCircles = s.activeCircles.filter(not(expired));
        return {
            ...s,
            expiredCircles,
            activeCircles: activeCircles.map((circle) =>
                this.moveCircle(circle),
            ),
            note: undefined,
            time: this.time,
            outputBy: "tick",
        };
    }

    moveCircle = (circle: Circle): Circle => ({
        ...circle,
        cy: String(Number(circle.cy) + 2),
    });
}

class CircleInfo implements Action {
    constructor(public readonly note: Note) {}

    createCircleInfo(note: Note) {
        const column = this.note.velocity % 4;
        if (column === 0) {
            return {
                r: `${Note.RADIUS}`,
                cx: "20%",
                cy: "0",
                style: "fill: green",
                class: "shadow",
            };
        } else if (column === 1) {
            return {
                r: `${Note.RADIUS}`,
                cx: "40%",
                cy: "0",
                style: "fill: red",
                class: "shadow",
            };
        } else if (column === 2) {
            return {
                r: `${Note.RADIUS}`,
                cx: "60%",
                cy: "0",
                style: "fill: blue",
                class: "shadow",
            };
        } else {
            return {
                r: `${Note.RADIUS}`,
                cx: "80%",
                cy: "0",
                style: "fill: yellow",
                class: "shadow",
            };
        }
    }

    apply(s: State): State {
        const circle = this.createCircleInfo(this.note);
        if (this.note.user_played) {
            return {
                ...s,
                note: undefined,
                activeCircles: s.activeCircles.concat([
                    { ...circle, id: String(s.circleCount) },
                ]),
                outputBy: "circleinfo",
                circleCount: s.circleCount + 1,
            };
        } else {
            return {
                ...s,
                note: this.note,
                outputBy: "circleinfo",
                circleCount: s.circleCount + 1,
            };
        }
    }
}

// class PressedKey implements Action {
//     constructor(public readonly e: KeyboardEvent) {}

//     apply(s: State):State {
//         return this.pressCircle(s)
//     }

//     getStaticXandY(): [string, number] {
//         const staticY = Constants.CIRCLE_CY
//         if (this.e.code === "KeyH") {
//             return [Constants.GREEN_CX, staticY]
//         } else if (this.e.code === "KeyJ") {
//             return [Constants.RED_CX, staticY]
//         } else if (this.e.code === "KeyK") {
//             return [Constants.BLUE_CX, staticY]
//         } else {
//             return [Constants.YELLOW_CX, staticY]
//         }
//     }

//     pressCircle = (s: State): State => {
//         console.log(s)
//         const collideCircle = s.activeCircles.filter(this.circleCollision)
//         const missedCircles = s.activeCircles.filter(not(this.circleCollision))
//         return {
//             ...s,
//             activeCircles: missedCircles,
//             expiredCircles: collideCircle
//         }
//     }

//     circleCollision = (circle: Circle) => {
//         const [staticX, staticY] = this.getStaticXandY()
//         if (staticX === circle.cx) {
//             const y = staticY - Number(circle.cy)
//             return Math.sqrt(y * y) < 200 * (5 / 100)
//         } else {
//             return false
//         }

//     }
// }

class PressedKey implements Action {
    constructor(public readonly e: KeyboardEvent) {}

    apply(s: State): State {
        return this.pressCircle(s);
    }

    getStaticXandY(): [string, number] {
        const staticY = Constants.CIRCLE_CY;
        switch (
            this.e.code // Changed to e.code instead of e.key
        ) {
            case "KeyH":
                return [Constants.GREEN_CX, staticY];
            case "KeyJ":
                return [Constants.RED_CX, staticY];
            case "KeyK":
                return [Constants.BLUE_CX, staticY];
            case "KeyL":
                return [Constants.YELLOW_CX, staticY];
            default:
                return ["0", 0]; // Should never hit this case
        }
    }

    pressCircle = (s: State): State => {
        console.log(s);
        const collidedCircles = s.activeCircles.filter(this.circleCollision);
        const remainingCircles = s.activeCircles.filter(
            not(this.circleCollision),
        );
        return {
            ...s,
            score: s.score + collidedCircles.length,
            activeCircles: remainingCircles,
            expiredCircles: collidedCircles.concat(s.expiredCircles), // Add collided circles to expired
        };
    };

    circleCollision = (circle: Circle): boolean => {
        const [staticX, staticY] = this.getStaticXandY();
        if (staticX === circle.cx) {
            const yDistance = staticY - Number(circle.cy);
            return Math.abs(yDistance) < Note.RADIUS; // Updated tolerance calculation
        }
        return false;
    };
}

// ######################################################################################################################

/**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @returns Updated state
 */
const tick = (s: State) => s;

/** Rendering (side effects) */

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

    // const key$ = fromEvent<KeyboardEvent>(document, "keypress");

    // const fromKey = (keyCode: Key) =>
    //     key$.pipe(filter(({ code }) => code === keyCode));

    const fromKey = (keyCode: Key) =>
        fromEvent<KeyboardEvent>(document, "keydown").pipe(
            filter(({ code }) => code === keyCode),
        );

    /** Determines the rate of time steps */
    const tick$ = interval(Constants.TICK_RATE_MS);

    // ######################################################################################################################
    // Added start
    // ######################################################################################################################

    /**
     * Renders the current state to the canvas.
     *
     * In MVC terms, this updates the View using the Model.
     *
     * @param s Current state
     */
    const render = (s: State) => {
        // Add blocks to the main grid canvas
        s.activeCircles.forEach((circle) => {
            const circleElement = createSvgElement(
                svg.namespaceURI,
                "circle",
                circle,
            );
            svg.appendChild(circleElement);
        });
    };

    const process = (csvContents: string) => {
        const lines = csvContents.split("\n");
        return from(lines).pipe(
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
                const processed = {
                    user_played: user_played === "True",
                    instrument_name,
                    velocity: Number(velocity),
                    pitch: Number(pitch),
                    start: Number(start),
                    end: Number(end),
                };
                return of(processed).pipe(delay(processed.start * 1000));
            }),
        );
    };

    // process(csvContents).pipe(
    //     scan((s: State, note: Note) => ({ note, gameEnd: false }), initialState)
    // ).subscribe((s: State) => {

    //     const note = s.note!

    //     if (note.user_played) {
    //         const circle = newRender(note)
    //         animate(circle, s)
    //         // ADown.subscribe(() => {
    //         //     const score = document.getElementById("scoreText")!
    //         //     score.textContent = "1"
    //         // })
    //     } else {
    //         // console.log(note)
    //         samples[note.instrument_name].triggerAttackRelease(
    //             Tone.Frequency(note.pitch, "midi").toNote(),
    //             note.end - note.start,
    //             undefined,
    //             note.velocity / 127
    //         );
    //     }

    //     if (s.gameEnd) {
    //         show(gameover);
    //     } else {
    //         hide(gameover);
    //     }
    // })
    const playNote = (s: State) => {
        const note = s.note!;
        samples[note.instrument_name].triggerAttackRelease(
            Tone.Frequency(note.pitch, "midi").toNote(),
            note.end - note.start,
            undefined,
            // note.velocity / 127
            note.velocity / 1000,
        );
    };

    const keyH$ = fromKey("KeyH").pipe(map((e) => new PressedKey(e)));
    const keyJ$ = fromKey("KeyJ").pipe(map((e) => new PressedKey(e)));
    const keyK$ = fromKey("KeyK").pipe(map((e) => new PressedKey(e)));
    const keyL$ = fromKey("KeyL").pipe(map((e) => new PressedKey(e)));
    const ticked$ = tick$.pipe(map((value) => new Tick(value)));
    const notes$ = process(csvContents).pipe(
        map((note: Note) => new CircleInfo(note)),
    );
    const source$ = merge(ticked$, notes$, keyH$, keyJ$, keyK$, keyL$)
        .pipe(scan(reduceState, initialState))
        .subscribe((s: State) => {
            // console.log(s)
            if (s.note) {
                playNote(s);
            }
            // render(s)
            const updateBodyView = (circle: Circle) => {
                function createBodyView() {
                    const circleElement = createSvgElement(
                        svg.namespaceURI,
                        "circle",
                        circle,
                    );
                    svg.appendChild(circleElement);
                    return circleElement;
                }
                const circleElement =
                    document.getElementById(circle.id) || createBodyView();
                circleElement.setAttribute("cy", circle.cy);
            };
            s.activeCircles.forEach(updateBodyView);

            s.expiredCircles.forEach((circle) => {
                const circleElement = document.getElementById(circle.id)!;
                svg.removeChild(circleElement);
            });

            const score = document.getElementById("scoreText")!;
            score.textContent = String(s.score);

            if (s.gameEnd) {
                show(gameover);
            } else {
                hide(gameover);
            }
        });

    // ######################################################################################################################
    // ######################################################################################################################
    // ######################################################################################################################
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

//////////CLOUDE//////////////

// import "./style.css";
// import { fromEvent, interval, merge, Observable } from "rxjs";
// import { map, filter, scan } from "rxjs/operators";
// import * as Tone from "tone";
// import { SampleLibrary } from "./tonejs-instruments";
// import { State, Action, Constants, Viewport } from "./types";
// import { initialState, reduceState } from "./state";
// import { updateView } from "./view";
// import { Key, Event, createSvgElement } from "./util";

// function main(csvContents: string, samples: { [key: string]: Tone.Sampler }) {
//     const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
//         HTMLElement;
//     const preview = document.querySelector(
//         "#svgPreview",
//     ) as SVGGraphicsElement & HTMLElement;
//     const gameover = document.querySelector("#gameOver") as SVGGraphicsElement &
//         HTMLElement;
//     const container = document.querySelector("#main") as HTMLElement;

//     svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
//     svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);

//     const multiplier = document.querySelector("#multiplierText") as HTMLElement;
//     const scoreText = document.querySelector("#scoreText") as HTMLElement;
//     const highScoreText = document.querySelector(
//         "#highScoreText",
//     ) as HTMLElement;

//     const key$ = fromEvent<KeyboardEvent>(document, "keypress");

//     const fromKey = (keyCode: Key) =>
//         key$.pipe(filter(({ code }) => code === keyCode));

//     const tick$ = interval(Constants.TICK_RATE_MS);

//     const keyH$: Observable<Action> = fromKey("KeyH").pipe(
//         map((): Action => ({ type: "keyPress", column: 0 })),
//     );
//     const keyJ$: Observable<Action> = fromKey("KeyJ").pipe(
//         map((): Action => ({ type: "keyPress", column: 1 })),
//     );
//     const keyK$: Observable<Action> = fromKey("KeyK").pipe(
//         map((): Action => ({ type: "keyPress", column: 2 })),
//     );
//     const keyL$: Observable<Action> = fromKey("KeyL").pipe(
//         map((): Action => ({ type: "keyPress", column: 3 })),
//     );

//     const action$: Observable<Action> = merge(
//         tick$.pipe(map((): Action => ({ type: "tick" }))),
//         keyH$,
//         keyJ$,
//         keyK$,
//         keyL$,
//     );

//     const state$ = action$.pipe(scan(reduceState, initialState));

//     state$.subscribe(
//         updateView(
//             svg,
//             gameover,
//             multiplier,
//             scoreText,
//             highScoreText,
//             samples,
//         ),
//     );
// }

// // The following runs your main function on window load.
// if (typeof window !== "undefined") {
//     const samples = SampleLibrary.load({
//         instruments: [
//             "bass-electric",
//             "violin",
//             "piano",
//             "trumpet",
//             "saxophone",
//             "trombone",
//             "flute",
//         ],
//         baseUrl: "samples/",
//     });

//     const startGame = (contents: string) => {
//         document.body.addEventListener(
//             "mousedown",
//             function () {
//                 main(contents, samples);
//             },
//             { once: true },
//         );
//     };

//     const { protocol, hostname, port } = new URL(import.meta.url);
//     const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ""}`;

//     Tone.ToneAudioBuffer.loaded().then(() => {
//         for (const instrument in samples) {
//             samples[instrument].toDestination();
//             samples[instrument].release = 0.5;
//         }

//         fetch(`${baseUrl}/assets/${Constants.SONG_NAME}.csv`)
//             .then((response) => response.text())
//             .then((text) => startGame(text))
//             .catch((error) =>
//                 console.error("Error fetching the CSV file:", error),
//             );
//     });
// }
