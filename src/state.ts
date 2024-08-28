import { State, Action, Circle, Note } from "./types";
import { Constants, not, Note as NoteConstants } from "./util";

export const initialState: State = {
    gameEnd: false,
    activeCircles: [],
    expiredCircles: [],
    note: undefined,
    noteToPlay: undefined,
    notes: [],
    score: 0,
    // time: 0,
    // outputBy: "tick",
    circleCount: 0,
    // h: false,
    // j: false,
    // k: false,
    // l: false,
} as const;

export class Tick implements Action {
    constructor(public readonly time: number) {}

    apply(s: State): State {
        const expired = (circle: Circle) => Number(circle.cy) > 400;
        const expiredCircles = s.activeCircles.filter(expired);
        const activeCircles = s.activeCircles.filter(not(expired));
        return {
            ...s,
            expiredCircles: expiredCircles,
            activeCircles: activeCircles.map((circle) =>
                this.moveCircle(circle),
            ),
            note: undefined,
            noteToPlay: undefined,
        };
        //     ...s,
        //     expiredCircles: expiredCircles,
        //     activeCircles: activeCircles.map((circle) =>
        //         this.moveCircle(circle),
        //     ),
        //     note: undefined,
        //     // time: this.time,
        //     // outputBy: "tick",
        // };
    }

    moveCircle = (circle: Circle): Circle => ({
        ...circle,
        cy: String(Number(circle.cy) + 2),
    });
}

export class CircleInfo implements Action {
    constructor(public readonly note: Note) {}

    createCircleInfo(note: Note) {
        const column = this.note.velocity % 4;
        if (column === 0) {
            return {
                r: `${NoteConstants.RADIUS}`,
                cx: "20%",
                cy: "0",
                style: "fill: green",
                class: "shadow",
            };
        } else if (column === 1) {
            return {
                r: `${NoteConstants.RADIUS}`,
                cx: "40%",
                cy: "0",
                style: "fill: red",
                class: "shadow",
            };
        } else if (column === 2) {
            return {
                r: `${NoteConstants.RADIUS}`,
                cx: "60%",
                cy: "0",
                style: "fill: blue",
                class: "shadow",
            };
        } else {
            return {
                r: `${NoteConstants.RADIUS}`,
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
                note: this.note,
                noteToPlay: undefined,
                activeCircles: s.activeCircles.concat([
                    { ...circle, id: String(s.circleCount) },
                ]),
                // outputBy: "circleinfo",
                notes: [...s.notes, this.note],
                circleCount: s.circleCount + 1,
            };
        } else {
            return {
                ...s,
                note: this.note,
                noteToPlay: undefined,
                notes: [...s.notes, this.note],
                // outputBy: "circleinfo",
                // circleCount: s.circleCount + 1,
            };
        }
    }
}

export class PressedKey implements Action {
    constructor(public readonly e: KeyboardEvent) {}

    getStaticXandY(): [string, number] {
        const staticY = Constants.CIRCLE_CY;
        switch (this.e.code) {
            case "KeyH":
                return [Constants.GREEN_CX, Number(staticY)];
            case "KeyJ":
                console.log("J pressed");
                return [Constants.RED_CX, Number(staticY)];
            case "KeyK":
                return [Constants.BLUE_CX, Number(staticY)];
            case "KeyL":
                return [Constants.YELLOW_CX, Number(staticY)];
            default:
                console.log("what is this");
                return ["0", 0];
        }
    }

    circleCollision = (circle: Circle): boolean => {
        const [staticX, staticY] = this.getStaticXandY();
        if (staticX === circle.cx) {
            const yDistance = staticY - Number(circle.cy);
            return Math.abs(yDistance) < NoteConstants.RADIUS;
        }
        return false;
    };

    pressCircle = (s: State): State & { noteToPlay?: Note } => {
        const collidedCircles = s.activeCircles.filter(this.circleCollision);
        const remainingCircles = s.activeCircles.filter(
            not(this.circleCollision),
        );

        // let noteToPlay: Note | undefined;
        // console.log("collidedCircles", collidedCircles);
        // if (collidedCircles.length > 0) {
        //     // Find the corresponding note for the collided circle
        //     noteToPlay = s.notes.find(
        //         (note) => note.start === Number(collidedCircles[0].id),
        //     );
        //     console.log(s.notes);
        //     console.log("noteToPlay", noteToPlay);
        //     console.log(Number(collidedCircles[0].id));
        // }

        return {
            ...s,
            score: s.score + collidedCircles.length,
            activeCircles: remainingCircles,
            expiredCircles: collidedCircles.concat(s.expiredCircles),
            // noteToPlay,
        };
    };

    apply(s: State): State {
        // const result = this.pressCircle(s);
        // console.log("circle", circle);
        return this.pressCircle(s);
    }
}

// pressCircle = (s: State): State => {
//     const collidedCircles = s.activeCircles.filter(this.circleCollision);
//     const remainingCircles = s.activeCircles.filter(
//         not(this.circleCollision),
//     );
//     return {
//         ...s,
//         score: s.score + collidedCircles.length,
//         activeCircles: remainingCircles,
//         expiredCircles: collidedCircles.concat(s.expiredCircles),
//     };
// };

// getNoteFromCircle(s: State): Note | undefined {
//     const [staticX, staticY] = this.getStaticXandY();
//     const collidedCircle = s.activeCircles.find(
//         (circle) =>
//             circle.cx === staticX &&
//             Math.abs(staticY - Number(circle.cy)) < NoteConstants.RADIUS,
//     );
//     if (collidedCircle) {
//         return s.note;
//     }
//     return undefined;
// }

export const reduceState = (s: State, action: Action) => {
    return action.apply(s);
};

// import { GameState, Note } from "./types";
// import { calculateScore, updateMultiplier } from "./util";

// export const initialState: GameState = {
//     notes: [],
//     player: {
//         score: 0,
//         streak: 0,
//         multiplier: 1,
//         missedNotes: 0,
//     },
//     gameOver: false,
//     time: 0,
// };

// export const reduceState = (state: GameState, action: any): GameState => {
//     switch (action.type) {
//         case "ADD_NOTE":
//             return { ...state, notes: [...state.notes, action.payload] };
//         case "HIT_NOTE":
//             const noteIndex = state.notes.findIndex(
//                 (note: Note) =>
//                     note.time === action.payload.time &&
//                     note.lane === action.payload.lane,
//             );
//             if (noteIndex >= 0 && !state.notes[noteIndex].hit) {
//                 const streak = state.player.streak + 1;
//                 const multiplier = updateMultiplier(streak);
//                 return {
//                     ...state,
//                     notes: state.notes.map((note, index) =>
//                         index === noteIndex ? { ...note, hit: true } : note,
//                     ),
//                     player: {
//                         ...state.player,
//                         score:
//                             state.player.score +
//                             calculateScore(streak, multiplier),
//                         streak,
//                         multiplier,
//                     },
//                 };
//             }
//             return state;
//         case "MISS_NOTE":
//             return {
//                 ...state,
//                 player: {
//                     ...state.player,
//                     missedNotes: state.player.missedNotes + 1,
//                     streak: 0, // Reset streak on missed note
//                     multiplier: 1, // Reset multiplier
//                 },
//             };
//         case "TICK":
//             return {
//                 ...state,
//                 time: state.time + action.payload,
//             };
//         case "END_GAME":
//             return { ...state, gameOver: true };
//         default:
//             return state;
//     }
// };
