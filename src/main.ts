// import { initialState, reduceState } from "./state";
// import { GameState } from "./types";
// import { renderNotes, renderGameOver, renderScore } from "./view";
// import { fromEvent, interval, Subject } from "rxjs";
// import { map, scan, startWith, takeWhile } from "rxjs/operators";

// const state$ = new Subject<GameState>();
// const action$ = new Subject<any>();

// // Handle state updates
// action$
//     .pipe(
//         scan(reduceState, initialState),
//         startWith(initialState),
//         takeWhile((state) => !state.gameOver),
//     )
//     .subscribe((state) => {
//         state$.next(state);
//     });

// // Handle game ticks
// interval(16)
//     .pipe(
//         map(() => ({ type: "TICK", payload: 0.016 })), // 60fps, hence 16ms per frame
//     )
//     .subscribe(action$);

// // Handle keyboard input
// const keyDown$ = fromEvent<KeyboardEvent>(document, "keydown").pipe(
//     map((event) => {
//         const lane = parseInt(event.key);
//         if (lane >= 0 && lane <= 3) {
//             return {
//                 type: "HIT_NOTE",
//                 payload: { lane, time: initialState.time },
//             };
//         } else {
//             return null;
//         }
//     }),
// );

// keyDown$.subscribe((action) => {
//     if (action) action$.next(action);
// });

// // Render the game state
// state$.subscribe((state) => {
//     renderNotes(state);
//     renderScore(state.player.score);
//     if (state.player.missedNotes > 10) {
//         action$.next({ type: "END_GAME" });
//         renderGameOver();
//     }
// });

// // Start the game
// action$.next({ type: "START_GAME" });

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
