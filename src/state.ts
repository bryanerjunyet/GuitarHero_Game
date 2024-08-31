import { Action, State, Note, Circle } from "./types";
import { getRandomNote, not, PlayKeys } from "./util";
import { Property } from "./util";

/** State processing */

export const initialState: State = {
    gameEnd: false,
    time: 0,
    playNotes: [],
    movingCircles: [],
    removeCircles: [],
    circleCount: 0,
    multiplier: 1,
    combo: 0,
    score: 0,
    miss: 0,
} as const;

class Tick implements Action {
    constructor(public readonly tick: number) {}

    moveCircle(circle: Circle) {
        return {
            ...circle,
            yCoordinate: String(Number(circle.yCoordinate) + 2),
        };
    }

    apply(s: State): State {
        const expired = (circle: Circle) => Number(circle.yCoordinate) > 400;
        const movingCircles = s.movingCircles
            .filter(not(expired))
            .map(this.moveCircle);
        const removeCircles = s.movingCircles.filter(expired);
        const missCircles = removeCircles.length;
        return {
            ...s,
            time: this.tick,
            playNotes: [],
            movingCircles: movingCircles,
            removeCircles: removeCircles,
            multiplier: missCircles > 0 ? 1 : s.multiplier,
            combo: missCircles > 0 ? 0 : s.combo,
            miss: s.miss + missCircles,
        };
    }
}

class PressKey implements Action {
    constructor(public readonly event: KeyboardEvent) {}

    getBasePoint(event: KeyboardEvent): [string, string] {
        return event.code === PlayKeys.PLAY_KEYS[0]
            ? [Property.GREEN_POINT[0], Property.BASE_POINT]
            : event.code === PlayKeys.PLAY_KEYS[1]
              ? [Property.RED_POINT[0], Property.BASE_POINT]
              : event.code === PlayKeys.PLAY_KEYS[2]
                ? [Property.BLUE_POINT[0], Property.BASE_POINT]
                : [Property.YELLOW_POINT[0], Property.BASE_POINT];
    }

    hitBasePoint = (circle: Circle): boolean => {
        const xBasePoint = this.getBasePoint(this.event)[0];
        const yBasePoint = this.getBasePoint(this.event)[1];
        return xBasePoint === circle.xCoordinate
            ? Math.abs(Number(yBasePoint) - Number(circle.yCoordinate)) <
                  Number(Property.RADIUS)
            : false;
    };

    apply(s: State): State {
        const movingCircles = s.movingCircles.filter(not(this.hitBasePoint));
        const hitCircles = s.movingCircles.filter(this.hitBasePoint);
        const multiplier =
            1 + Math.floor((s.combo + hitCircles.length) / 10) * 0.2;
        return hitCircles.length > 0
            ? {
                  ...s,
                  playNotes: hitCircles.map((circle) => circle.note),
                  movingCircles: movingCircles,
                  removeCircles: hitCircles,
                  multiplier: multiplier,
                  combo: s.combo + hitCircles.length,
                  score: Math.round(s.score + hitCircles.length * multiplier),
              }
            : {
                  ...s,
                  playNotes: [getRandomNote(s.time)],
                  multiplier: 1,
                  combo: 0,
              };
    }
}

class PlayNote implements Action {
    constructor(public readonly note: Note) {}

    circleInfo(note: Note) {
        const column = Number(note.pitch) % 4;
        return column === 0
            ? Property.GREEN_POINT
            : column === 1
              ? Property.RED_POINT
              : column === 2
                ? Property.BLUE_POINT
                : Property.YELLOW_POINT;
    }

    apply(s: State): State {
        const xCoordinate = this.circleInfo(this.note)[0];
        const style = this.circleInfo(this.note)[1];
        return this.note.user_played
            ? {
                  ...s,
                  movingCircles: s.movingCircles.concat({
                      id: s.circleCount,
                      radius: Property.RADIUS,
                      xCoordinate: xCoordinate,
                      yCoordinate: "0",
                      style: style,
                      class: Property.CIRCLE_CLASS,
                      note: this.note,
                  }),
                  circleCount: s.circleCount + 1,
              }
            : {
                  ...s,
                  playNotes: [this.note],
              };
    }
}

class End implements Action {
    apply(s: State): State {
        return {
            ...s,
            gameEnd: true,
        };
    }
}

export { Tick, PlayNote, PressKey, End };
