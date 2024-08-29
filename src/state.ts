import { Key, Event, Action, State, Note, Circle } from "./types";
import { not } from "./util";
import { Constants } from "./main";

/** State processing */

export const initialState: State = {
    gameEnd: false,
    renderCircles: [],
    removeCircles: [],
    playNotes: [],
    circleCount: 0,
    score: 0,

    output: "",
    time: 0,
} as const;

class Tick implements Action {
    constructor(public readonly tick: number) {}

    apply(s: State): State {
        const expired = (circle: Circle) => Number(circle.cy) > 400;
        const removeCircles = s.renderCircles.filter(expired);
        const renderCircles = s.renderCircles
            .filter(not(expired))
            .map(this.moveCircle);
        return {
            ...s,
            renderCircles,
            removeCircles,
            playNotes: [],

            output: "Tick",
            time: this.tick,
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
    constructor(public readonly note: Note) {}

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

                output: "ProcessNote",
            };
        } else {
            const circle = {
                id: "circle" + String(s.circleCount),
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

                output: "ProcessNote",
            };
        }
    }
}

class PressKey implements Action {
    constructor(public readonly event: KeyboardEvent) {}

    apply(s: State): State {
        const collidedCircles = s.renderCircles.filter(this.circleCollision);
        const renderCircles = s.renderCircles.filter(not(this.circleCollision));
        const playNotes = collidedCircles.map((circle) => circle.note);
        return {
            ...s,
            renderCircles,
            removeCircles: collidedCircles,
            playNotes,
            score: s.score + collidedCircles.length,
        };
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

export { Tick, ProcessNote, PressKey };
