export interface Note {
    time: number; // Time when the note should be hit
    lane: number; // Lane index (e.g., 0 for leftmost lane)
    hit?: boolean; // Whether the note was hit
}

export interface PlayerState {
    score: number;
    streak: number;
    multiplier: number;
    missedNotes: number;
}

export interface GameState {
    notes: Note[];
    player: PlayerState;
    gameOver: boolean;
    time: number;
}

// export type GameAction =
//     | { type: "START_GAME" }
//     | { type: "TICK"; payload: number }
//     | { type: "HIT_NOTE"; payload: { lane: number; time: number } }
//     | { type: "END_GAME" };

export type Lane = 0 | 1 | 2 | 3; // Represents the lanes in the game
