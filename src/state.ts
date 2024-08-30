import { Key, Event, Action, State, Note, Circle } from "./types";
import { getRandomNote, not, playRandom } from "./util";
import { Constants } from "./util";

/** State processing */

export const initialState: State = {
    gameEnd: false,
    renderCircles: [],
    removeCircles: [],
    playNotes: [],
    circleCount: 0,
    score: 0,
    multiplier: 1,
    combo: 0,
    miss: 0,
    wrongNote: false,
} as const;

class Tick implements Action {
    constructor(public readonly tick: number) {}

    apply(s: State): State {
        const expired = (circle: Circle) => Number(circle.cy) > 400;
        const removeCircles = s.renderCircles.filter(expired);
        const renderCircles = s.renderCircles
            .filter(not(expired))
            .map(this.moveCircle);
        const missCircles = removeCircles.length;
        // const gameOver = !!renderCircles.find(
        //     (circle) => circle.id === Infinity,
        // );
        // console.log("Game Over", gameOver);
        // console.log("Miss", miss);
        // console.log("MissCircles", missCircles);
        // const gameOver = s.renderCircles.filter(expired).length === 0;
        // const trueCombo = renderCircles === removeCircles;

        // const gameOver = (circle: Circle) => circle.id === "ENDNOTE"
        // ) && (s.renderCircles.filter(expired).length >= 30);
        return {
            ...s,
            // gameEnd: gameOver,
            renderCircles,
            removeCircles,
            playNotes: [],
            miss: s.miss + missCircles,
            combo: missCircles > 0 ? 0 : s.combo,
            wrongNote: false,
        };
    }

    moveCircle(circle: Circle) {
        return {
            ...circle,
            cy: String(Number(circle.cy) + 2),
        };
    }
}

class ProcessNote implements Action {
    constructor(
        public readonly note: Note,
        // public readonly lastNote: boolean,
    ) {}

    circleProperties(note: Note) {
        const position = Number(note.pitch) % 4;
        if (position === 0) {
            return Constants.GREEN_CX;
        } else if (position === 1) {
            return Constants.RED_CX;
        } else if (position === 2) {
            return Constants.BLUE_CX;
        } else {
            return Constants.YELLOW_CX;
        }
    }

    apply(s: State): State {
        const [cx, style] = this.circleProperties(this.note);
        if (!this.note.user_played) {
            return {
                ...s,
                playNotes: [this.note],
            };
        } else {
            // console.log("Last Note", this.lastNote);
            // if (this.lastNote) {
            //     console.log("Last", s.renderCircles);
            // }
            const circle = {
                // id: this.lastNote ? Infinity : Number(s.circleCount),
                id: Number(s.circleCount),
                r: Constants.RADIUS,
                cx,
                cy: "0",
                style,
                class: Constants.CIRCLE_CLASS,
                note: this.note,
            };
            return {
                ...s,
                renderCircles: s.renderCircles.concat(circle),
                circleCount: s.circleCount + 1,
                playNotes: [],
            };
        }
    }
}

class PressKey implements Action {
    constructor(public readonly event: KeyboardEvent) {}

    apply(s: State): State {
        const collidedCircles = s.renderCircles.filter(this.circleCollision);
        const renderCircles = s.renderCircles.filter(not(this.circleCollision));

        console.log("Render Circles", renderCircles);
        if (collidedCircles.length === 0) {
            console.log("No collision detected", collidedCircles);
            // No collision detected, generate a random note

            // const randomNote = getRandomNote();
            // playRandom(randomNote, Constants.SAMPLES);
            // console.log("Random Note", randomNote);
            return {
                ...s,
                removeCircles: [],
                score: s.score,
                multiplier: 1,
                // combo: 0,
                wrongNote: true,
            };
        } else {
            console.log("Collision detected", collidedCircles);
            const playNotes = collidedCircles.map((circle) => circle.note);
            const newCombo = s.combo + collidedCircles.length;
            const newMultiplier = 1 + Math.floor(newCombo / 10) * 0.2;
            return {
                ...s,
                renderCircles,
                removeCircles: collidedCircles,
                playNotes,
                score: Math.round(
                    s.score + collidedCircles.length * newMultiplier,
                ),
                multiplier: newMultiplier,
                combo: newCombo,
                // wrongNote: false,
            };
        }
    }

    getStaticXandY(event: KeyboardEvent): [string, string] {
        const staticY = Constants.CY;
        if (event.code === "KeyH") {
            return [Constants.GREEN_CX[0], staticY];
        } else if (event.code === "KeyJ") {
            return [Constants.RED_CX[0], staticY];
        } else if (event.code === "KeyK") {
            return [Constants.BLUE_CX[0], staticY];
        } else {
            return [Constants.YELLOW_CX[0], staticY];
        }
    }

    circleCollision = (circle: Circle): boolean => {
        const [staticX, staticY] = this.getStaticXandY(this.event);
        if (staticX === circle.cx) {
            const distanceY = Number(staticY) - Number(circle.cy);
            return Math.abs(distanceY) < Number(Constants.RADIUS);
        } else {
            return false;
        }
    };
}

class End implements Action {
    apply(s: State): State {
        return {
            ...s,
            gameEnd: true,
        };
    }
}

export { Tick, ProcessNote, PressKey, End };
