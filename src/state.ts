// import { State, Note } from "./types";

// export const initialState: State = {
//     notes: [],
//     score: 0,
//     gameEnd: false,
// };

// export function tick(state: State, elapsed: number): State {
//     const updatedNotes = state.notes.map((note) => ({
//         ...note,
//         y: note.y + elapsed * 0.1, // Move notes down the screen
//     }));

//     const gameEnd = updatedNotes.some((note) => note.y > 500); // Arbitrary end condition

//     return {
//         ...state,
//         notes: updatedNotes,
//         gameEnd,
//     };
// }

// export function updateScore(state: State, points: number) {
//     state.score += points;
// }

// export function addNote(state: State, note: Note) {
//     state.notes.push(note);
// }

// export function endGame(state: State) {
//     console.log("Game Over!");
//     state.gameEnd = true;
// }

// import { State } from "./types";

// export const initialState: State = {
//     gameEnd: false,
//     circles: [],
// };

// export const tick = (s: State): State => {
//     const newState = { ...s };
//     // Implement the logic for moving the circles down the board
//     newState.circles = s.circles.map((c) => ({ ...c, cy: c.cy + 10 }));
//     newState.gameEnd = newState.circles.some((c) => c.cy > 400);
//     return newState;
// };

import { State, Action, Note } from "./types";
import { Viewport } from "./types";

export const initialState: State = {
    gameEnd: false,
    notes: [],
    score: 0,
    multiplier: 1,
    consecutiveHits: 0,
};

export const reduceState = (s: State, action: Action): State => {
    switch (action.type) {
        case "tick":
            return tick(s);
        case "keyPress":
            return keyPress(s, action.column);
        default:
            return s;
    }
};

const tick = (s: State): State => {
    const movedNotes = s.notes.map((note) => ({
        ...note,
        y: note.y + Viewport.CANVAS_HEIGHT / 100, // Move notes down
    }));

    const activeNotes = movedNotes.filter(
        (note) => note.y <= Viewport.CANVAS_HEIGHT,
    );
    const missedNotes = movedNotes.filter(
        (note) => note.y > Viewport.CANVAS_HEIGHT,
    );

    return {
        ...s,
        notes: activeNotes,
        score: s.score - missedNotes.length * 5, // Penalty for missed notes
        consecutiveHits: 0,
        multiplier: 1,
    };
};

const keyPress = (s: State, column: number): State => {
    const hitNote = s.notes.find(
        (note) =>
            note.column === column &&
            Math.abs(note.y - Viewport.CANVAS_HEIGHT * 0.9) < 20, // Hit zone
    );

    if (hitNote) {
        const newConsecutiveHits = s.consecutiveHits + 1;
        const newMultiplier = Math.floor(newConsecutiveHits / 10) * 0.2 + 1;

        return {
            ...s,
            notes: s.notes.filter((note) => note !== hitNote),
            score: s.score + 10 * s.multiplier,
            consecutiveHits: newConsecutiveHits,
            multiplier: newMultiplier,
        };
    } else {
        return {
            ...s,
            score: s.score - 5,
            consecutiveHits: 0,
            multiplier: 1,
        };
    }
};
