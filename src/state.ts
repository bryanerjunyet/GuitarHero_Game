import { GameState, Note } from "./types";
import { calculateScore, updateMultiplier } from "./util";

export const initialState: GameState = {
    notes: [],
    player: {
        score: 0,
        streak: 0,
        multiplier: 1,
        missedNotes: 0,
    },
    gameOver: false,
    time: 0,
};

export const reduceState = (state: GameState, action: any): GameState => {
    switch (action.type) {
        case "ADD_NOTE":
            return { ...state, notes: [...state.notes, action.payload] };
        case "HIT_NOTE":
            const noteIndex = state.notes.findIndex(
                (note: Note) =>
                    note.time === action.payload.time &&
                    note.lane === action.payload.lane,
            );
            if (noteIndex >= 0 && !state.notes[noteIndex].hit) {
                const streak = state.player.streak + 1;
                const multiplier = updateMultiplier(streak);
                return {
                    ...state,
                    notes: state.notes.map((note, index) =>
                        index === noteIndex ? { ...note, hit: true } : note,
                    ),
                    player: {
                        ...state.player,
                        score:
                            state.player.score +
                            calculateScore(streak, multiplier),
                        streak,
                        multiplier,
                    },
                };
            }
            return state;
        case "MISS_NOTE":
            return {
                ...state,
                player: {
                    ...state.player,
                    missedNotes: state.player.missedNotes + 1,
                    streak: 0, // Reset streak on missed note
                    multiplier: 1, // Reset multiplier
                },
            };
        case "TICK":
            return {
                ...state,
                time: state.time + action.payload,
            };
        case "END_GAME":
            return { ...state, gameOver: true };
        default:
            return state;
    }
};
