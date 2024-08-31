/**
 * This types.ts file defines the core types used throughout the Guitar Hero-like game.
 * The file includes TypeScript types and interfaces for representing the state of the game,
 * user input, musical notes, circles on the screen, and actions that modify the game state.
 *
 * These types ensure the game's logic and structure are consistent and type-safe,
 * allowing for easier development and debugging.
 */

/**
 * The Key type represents the specific keyboard keys that can be pressed
 * by the player to interact with the game.
 */
type Key = "KeyH" | "KeyJ" | "KeyK" | "KeyL";

/**
 * The Event type represents the different keyboard events
 * that can be triggered by the player in the game.
 */
type Event = "keydown" | "keyup" | "keypress";

/**
 * The State type represents the immutable state of the game at any point in time.
 */
type State = Readonly<{
    gameEnd: boolean;
    time: number;
    playNotes: ReadonlyArray<Note>;
    movingCircles: ReadonlyArray<Circle>;
    removeCircles: ReadonlyArray<Circle>;
    circleCount: number;
    multiplier: number;
    combo: number;
    score: number;
}>;

/**
 * The Note type represents a musical note in the game.
 */
type Note = Readonly<{
    user_played: boolean;
    instrument_name: string;
    velocity: number;
    pitch: number;
    start: number;
    end: number;
}>;

/**
 * The Circle type represents a circle on the screen that corresponds to a musical note.
 * The circle's position and appearance are used to visually represent the note in the game.
 */
type Circle = Readonly<{
    id: number;
    radius: string;
    xCoordinate: string;
    yCoordinate: string;
    style: string;
    class: "shadow";
    note: Note;
}>;

/**
 * The Action interface defines a contract for actions that can be applied to the game state.
 * Implementations of this interface will define how the state is modified when the action is applied.
 */
interface Action {
    /**
     * Applies the action to the given state and returns the updated state.
     *
     * @param s - The current state of the game.
     * @returns The new state after the action has been applied.
     */
    apply(s: State): State;
}

export type { Key, Event, Action, State, Note, Circle };
