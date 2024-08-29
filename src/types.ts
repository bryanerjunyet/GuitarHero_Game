/** User input */

type Key = "KeyH" | "KeyJ" | "KeyK" | "KeyL";

type Event = "keydown" | "keyup" | "keypress";

interface Action {
    apply(s: State): State;
}

type State = Readonly<{
    gameEnd: boolean;
    renderCircles: ReadonlyArray<Circle>;
    removeCircles: ReadonlyArray<Circle>;
    playNotes: ReadonlyArray<Note>;
    circleCount: number;
    score: number;

    output: string;
    time: number;
}>;

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
    class: "shadow";
    note: Note;
}>;

export type { Key, Event, Action, State, Note, Circle };
