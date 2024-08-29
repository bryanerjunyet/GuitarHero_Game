import { Action, State } from "./types";

export const Viewport = {
    CANVAS_WIDTH: 200,
    CANVAS_HEIGHT: 400,
} as const;

export const Constants = {
    TICK_RATE_MS: 10,
    GREEN_CX: 40,
    RED_CX: 80,
    BLUE_CX: 120,
    YELLOW_CX: 160,
    CIRCLE_CY: 350,
    SONG_NAME: "RockinRobin",
} as const;

export const Note = {
    RADIUS: 0.07 * Viewport.CANVAS_WIDTH,
    TAIL_WIDTH: 10,
};

export const not =
    <T>(f: (x: T) => boolean) =>
    (x: T) =>
        !f(x);

export const createSvgElement = (
    namespace: string | null,
    name: string,
    props: Record<string, string> = {},
) => {
    const elem = document.createElementNS(namespace, name) as SVGElement;
    Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
    return elem;
};

// import { Note } from "./types";

// export const torusWrap = (value: number, min: number, max: number): number => {
//     return value < min ? max : value > max ? min : value;
// };

// export const calculateScore = (streak: number, multiplier: number): number => {
//     return 100 * multiplier * streak;
// };

// export const generateNotes = (): Note[] => {
//     // Generates an array of notes with random time and lane values
//     return Array.from({ length: 100 }, () => ({
//         time: Math.random() * 60, // Notes spread over 60 seconds
//         lane: Math.floor(Math.random() * 4), // Four lanes
//     }));
// };

// export const updateMultiplier = (streak: number): number => {
//     if (streak < 10) return 1;
//     if (streak < 20) return 2;
//     if (streak < 30) return 3;
//     return 4;
// };
