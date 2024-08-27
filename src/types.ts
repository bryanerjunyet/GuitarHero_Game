// export type Key = "H" | "J" | "K" | "L";

// export interface Note {
//     time: number;
//     key: Key;
//     x: number;
//     y: number;
//     isActive: boolean;
// }

// export interface State {
//     notes: Note[];
//     score: number;
//     gameEnd: boolean;
// }

// export type Key = "KeyH" | "KeyJ" | "KeyK" | "KeyL";

// export type Note = {
//     r: number;
//     cx: string;
//     cy: number;
//     color: string;
// };

// export const Constants = {
//     TICK_RATE_MS: 500,
//     SONG_NAME: "RockinRobin",
// } as const;

// export type State = Readonly<{
//     gameEnd: boolean;
//     circles: Note[];
// }>;

export const Viewport = {
    CANVAS_WIDTH: 200,
    CANVAS_HEIGHT: 400,
} as const;

export const Constants = {
    TICK_RATE_MS: 500,
    SONG_NAME: "RockinRobin",
} as const;

export const Note = {
    RADIUS: 0.07 * Viewport.CANVAS_WIDTH,
    TAIL_WIDTH: 10,
};

export type State = Readonly<{
    gameEnd: boolean;
    notes: ReadonlyArray<{
        x: number;
        y: number;
        column: number;
        duration: number;
    }>;
    score: number;
    multiplier: number;
    consecutiveHits: number;
}>;

export type Action = { type: "tick" } | { type: "keyPress"; column: number };
