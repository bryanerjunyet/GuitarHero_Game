import {
    toCircle,
    toCircleNote,
    State,
    CircleNote,
    Action,
    Note,
} from "./types";
import { Constants, not, Note as NoteConstants } from "./util";
import * as Tone from "tone";

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

// export class Tick implements Action {
//     constructor(public readonly time: number) {}

//     apply(s: State): State {
//         const expired = (circle: Circle) => Number(circle.cy) > 400;
//         const expiredCircles = s.activeCircles.filter(expired);
//         const activeCircles = s.activeCircles.filter(not(expired));
//         return {
//             ...s,
//             expiredCircles: expiredCircles,
//             activeCircles: activeCircles.map((circle) =>
//                 this.moveCircle(circle),
//             ),
//             note: undefined,
//             noteToPlay: undefined,
//         };
//     }

//     moveCircle = (circle: Circle): Circle => ({
//         ...circle,
//         cy: String(Number(circle.cy) + 2),
//     });
// }

export class Tick implements Action {
    constructor(public readonly time: number) {}

    apply(s: State): State {
        const expired = (circleNote: CircleNote) => circleNote.cy > 400;
        const expiredCircleNotes = s.activeCircles
            .map((circle) => toCircleNote(circle, s.note!))
            .filter(expired);
        const activeCircleNotes = s.activeCircles
            .map((circle) => toCircleNote(circle, s.note!))
            .filter(not(expired));

        return {
            ...s,
            expiredCircles: expiredCircleNotes.map(toCircle),
            activeCircles: activeCircleNotes.map(this.moveCircle),
            note: undefined,
            noteToPlay: undefined,
        };
    }

    moveCircle = (circleNote: CircleNote): CircleNote => ({
        ...circleNote,
        cy: circleNote.cy + 2,
    });
}

export class CircleInfo implements Action {
    constructor(public readonly note: Note) {}

    createCircleInfo(note: Note): CircleNote {
        const column = note.pitch % 4;
        const cx =
            column === 0 ? 40 : column === 1 ? 80 : column === 2 ? 120 : 160;
        const color =
            column === 0
                ? "green"
                : column === 1
                  ? "red"
                  : column === 2
                    ? "blue"
                    : "yellow";

        return {
            user_played: note.user_played,
            instrument_name: note.instrument_name,
            velocity: note.velocity,
            pitch: note.pitch,
            start: note.start,
            end: note.end,
            id: String(Date.now()), // Generate a unique ID for the circle
            r: `${NoteConstants.RADIUS}`,
            cx: cx,
            cy: 0,
            style: `fill: ${color}`,
            class: "shadow",
        };
    }

    apply(s: State): State {
        const circleNote = this.createCircleInfo(this.note);
        return {
            ...s,
            note: this.note,
            noteToPlay: undefined,
            activeCircles: s.activeCircles.concat(circleNote),
            notes: [...s.notes, this.note],
            circleCount: s.circleCount + 1,
        };
    }
}

// export class CircleInfo implements Action {
//     constructor(public readonly note: Note) {}

//     createCircleInfo(note: Note) {
//         const column = this.note.pitch % 4;
//         if (column === 0) {
//             return {
//                 r: `${NoteConstants.RADIUS}`,
//                 cx: "20%",
//                 cy: "0",
//                 style: "fill: green",
//                 class: "shadow",
//             };
//         } else if (column === 1) {
//             return {
//                 r: `${NoteConstants.RADIUS}`,
//                 cx: "40%",
//                 cy: "0",
//                 style: "fill: red",
//                 class: "shadow",
//             };
//         } else if (column === 2) {
//             return {
//                 r: `${NoteConstants.RADIUS}`,
//                 cx: "60%",
//                 cy: "0",
//                 style: "fill: blue",
//                 class: "shadow",
//             };
//         } else {
//             return {
//                 r: `${NoteConstants.RADIUS}`,
//                 cx: "80%",
//                 cy: "0",
//                 style: "fill: yellow",
//                 class: "shadow",
//             };
//         }
//     }

//     apply(s: State): State {
//         const circle = this.createCircleInfo(this.note);
//         if (this.note.user_played) {
//             return {
//                 ...s,
//                 note: this.note,
//                 noteToPlay: undefined,
//                 activeCircles: s.activeCircles.concat([
//                     { ...circle, id: String(s.circleCount) },
//                 ]),
//                 // outputBy: "circleinfo",
//                 notes: [...s.notes, this.note],
//                 circleCount: s.circleCount + 1,
//             };
//         } else {
//             return {
//                 ...s,
//                 note: this.note,
//                 noteToPlay: undefined,
//                 // notes: [...s.notes, this.note],
//                 // outputBy: "circleinfo",
//                 // circleCount: s.circleCount + 1,
//             };
//         }
//     }
// }
// class NotePress implements Action {
//     constructor(
//       public readonly column: number,
//       public readonly samples: { [key: string]: Tone.Sampler }
//     ) {}

//     apply(s: State): State {
//       // Find the note to play based on the column and position
//       const noteToPlay = s.note.find(
//         note =>
//           note.positionX === this.column &&
//           note.positionY >= 330 &&
//           note.positionY <= 360 &&
//           note.user_played
//       );

//       if (noteToPlay) {
//         // Play the note that matches the column and position
//         playNote(noteToPlay, this.samples);

//         const newConsecutiveCount = s.consecutiveNoteCount + 1;

//         // Calculate new multiplier: starts at 1 and increases by 0.2 for every 10 consecutive notes
//         const newMultiplier = 1 + Math.floor(newConsecutiveCount / 10) * 0.2;

//         // Update the score with the multiplier
//         const newScore = s.score + 10 * newMultiplier;

//         console.log(`New Score: ${newScore}, Multiplier: ${newMultiplier}`);

//         return {
//           ...s,
//           score: newScore, // Update the score in state
//           consecutiveNoteCount: newConsecutiveCount, // Update the consecutive note count
//           multiplier: newMultiplier // Update the multiplier
//         };
//       } else {
//         // If no note is found or wrong key pressed, reset consecutive count and multiplier
//         return {
//           ...s,
//           consecutiveNoteCount: 0, // Reset consecutive count
//           multiplier: 1, // Reset multiplier
//         };
//       }
//     }
//   }
// export class PressedKey implements Action {
//     constructor(
//         public readonly column: string,
//         public readonly samples: { [key: string]: Tone.Sampler },
//     ) {}

//     getStaticXandY(): [string, number] {
//         const staticY = Constants.CIRCLE_CY;
//         switch (this.e.code) {
//             case "KeyH":
//                 return [Constants.GREEN_CX, Number(staticY)];
//             case "KeyJ":
//                 console.log("J pressed");
//                 return [Constants.RED_CX, Number(staticY)];
//             case "KeyK":
//                 return [Constants.BLUE_CX, Number(staticY)];
//             case "KeyL":
//                 return [Constants.YELLOW_CX, Number(staticY)];
//             default:
//                 console.log("what is this");
//                 return ["0", 0];
//         }
//     }

//     circleCollision = (circle: Circle): boolean => {
//         const [staticX, staticY] = this.getStaticXandY();
//         if (staticX === circle.cx) {
//             const yDistance = staticY - Number(circle.cy);
//             playNote();
//             return Math.abs(yDistance) < NoteConstants.RADIUS;
//         }
//         return false;
//     };

//     pressCircle = (s: State): State & { noteToPlay?: Note } => {
//         const collidedCircles = s.activeCircles.filter(this.circleCollision);
//         const remainingCircles = s.activeCircles.filter(
//             not(this.circleCollision),
//         );

//         return {
//             ...s,
//             score: s.score + collidedCircles.length,
//             activeCircles: remainingCircles,
//             expiredCircles: collidedCircles.concat(s.expiredCircles),
//             // noteToPlay,
//         };
//     };

//     apply(s: State): State {
//         // const result = this.pressCircle(s);
//         // console.log("circle", circle);
//         // Find the note to play based on the column and position
//         const noteToPlay = s.note.find(
//             (note) =>
//                 note.positionX === this.column &&
//                 note.positionY >= 330 &&
//                 note.positionY <= 360 &&
//                 note.user_played,
//         );
//         return this.pressCircle(s);
//     }
// }

export class PressedKey implements Action {
    constructor(
        public readonly column: number,
        public readonly samples: { [key: string]: Tone.Sampler },
        private readonly e: KeyboardEvent,
    ) {}

    getStaticXandY(): [number, number] {
        const staticY = Constants.CIRCLE_CY;
        switch (this.e.code) {
            case "KeyH":
                return [Constants.GREEN_CX, staticY];
            case "KeyJ":
                return [Constants.RED_CX, staticY];
            case "KeyK":
                return [Constants.BLUE_CX, staticY];
            case "KeyL":
                return [Constants.YELLOW_CX, staticY];
            default:
                console.log("Unexpected key pressed");
                return [0, 0];
        }
    }

    circleCollision = (circleNote: CircleNote): boolean => {
        const [staticX, staticY] = this.getStaticXandY();
        return (
            circleNote.cx === staticX &&
            Math.abs(staticY - circleNote.cy) < NoteConstants.RADIUS
        );
    };

    pressCircle = (s: State): State & { noteToPlay?: Note } => {
        // Find collided circle notes
        // const collidedCircleNotes = s.activeCircles.filter(this.circleCollision);
        // const remainingCircleNotes = s.activeCircles.filter(circleNote => !this.circleCollision(circleNote));

        // Find the relevant note to play based on the column
        const noteToPlay = s.notes.find(
            (note) =>
                note.pitch % 4 === this.column &&
                note.start >= 330 &&
                note.end <= 360 &&
                note.user_played,
        );

        if (noteToPlay) {
            console.log("Sound Played");
            playNote(noteToPlay, this.samples);
        }

        return {
            ...s,
            score: s.score + 10,
            // activeCircles: remainingCircleNotes,
            // expiredCircles: collidedCircleNotes.concat(s.expiredCircles),
            noteToPlay, // Include the noteToPlay in the new state
        };
    };

    apply(s: State): State {
        return this.pressCircle(s);
    }
}

/**
 * This function plays a note using the Tone.js library.
 * It triggers a note based on the provided Note object.
 * @param note
 */
const playNote = (note: Note, samples: { [key: string]: Tone.Sampler }) => {
    samples[note.instrument_name].triggerAttackRelease(
        Tone.Frequency(note.pitch, "midi").toNote(),
        note.end - note.start,
        undefined,
        note.velocity,
    );
};

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
