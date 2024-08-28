import { Viewport } from "./util";

export type Key = "KeyH" | "KeyJ" | "KeyK" | "KeyL";

export type Event = "keydown" | "keyup" | "keypress";

export type State = Readonly<{
    gameEnd: boolean;
    activeCircles: ReadonlyArray<Circle>;
    expiredCircles: ReadonlyArray<Circle>;
    note: Note | undefined;
    noteToPlay: Note | undefined;
    notes: ReadonlyArray<Note>;
    score: number;
    // time: number;
    // outputBy: string;
    circleCount: number;

    // h: boolean;
    // j: boolean;
    // k: boolean;
    // l: boolean;
}>;

export type Note = Readonly<{
    user_played: boolean;
    instrument_name: string;
    velocity: number;
    pitch: number;
    start: number;
    end: number;
}>;

export type Circle = Readonly<{
    id: string;
    r: string;
    cx: string;
    cy: string;
    style: string;
    class: string;
}>;

export interface Action {
    apply(s: State): State;
}

// export interface Note {
//     time: number; // Time when the note should be hit
//     lane: number; // Lane index (e.g., 0 for leftmost lane)
//     hit?: boolean; // Whether the note was hit
// }

// export interface PlayerState {
//     score: number;
//     streak: number;
//     multiplier: number;
//     missedNotes: number;
// }

// export interface GameState {
//     notes: Note[];
//     player: PlayerState;
//     gameOver: boolean;
//     time: number;
// }

// // export type GameAction =
// //     | { type: "START_GAME" }
// //     | { type: "TICK"; payload: number }
// //     | { type: "HIT_NOTE"; payload: { lane: number; time: number } }
// //     | { type: "END_GAME" };

// export type Lane = 0 | 1 | 2 | 3; // Represents the lanes in the game
