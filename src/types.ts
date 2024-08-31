/** User input */
type Key = "KeyH" | "KeyJ" | "KeyK" | "KeyL";

type Event = "keydown" | "keyup" | "keypress";

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
    miss: number;
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
    id: number;
    radius: string;
    xCoordinate: string;
    yCoordinate: string;
    style: string;
    class: "shadow";
    note: Note;
}>;

interface Action {
    apply(s: State): State;
}

export type { Key, Event, Action, State, Note, Circle };
