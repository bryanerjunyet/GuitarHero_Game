/**
 * This state.ts file defines the logic for managing the game's state transitions in a Guitar Hero-like game.
 * It includes classes that implement the `Action` interface to update the state based on different types of actions:
 * ticking the game clock, processing keyboard events, playing notes, and ending the game.
 *
 * Each class has methods to apply changes to the immutable state object according to the specific action
 * it represents, such as moving circles on the screen, detecting key presses, and spawning new notes.
 */
import { Action, State, Note, Circle } from "./types";
import { getRandomNote, not, PlayKeys } from "./util";
import { Property } from "./util";

/**
 * The initialState constant defines the starting state of the game.
 * It initializes all game variables, such as score, combo and the list of circles on the screen.
 */
const initialState: State = {
    gameEnd: false,
    time: 0,
    playNotes: [],
    movingCircles: [],
    removeCircles: [],
    circleCount: 0,
    multiplier: 1,
    combo: 0,
    score: 0,
} as const;

/**
 * The Tick class represents the action of advancing the game clock.
 * This class handles moving circles down the screen and updating the game state accordingly.
 */
class Tick implements Action {
    /** The constructor takes the current time tick as an argument. */
    constructor(public readonly tick: number) {}

    /**
     * Moves the circle down the screen by updating its y-coordinate.
     *
     * @param circle - The circle to be moved.
     * @returns The updated circle with a new y-coordinate.
     */
    moveCircle = (circle: Circle) => {
        return {
            ...circle,
            yCoordinate: String(Number(circle.yCoordinate) + 2),
        };
    };

    /**
     * Applies the tick action to the game state, moving circles and handling miss circles.
     *
     * @param s - The current state of the game.
     * @returns The new state after applying the tick action.
     */
    apply = (s: State): State => {
        //checking of circles out of canvas view
        const miss = (circle: Circle) => Number(circle.yCoordinate) > 400;
        //circles to be moving
        const movingCircles = s.movingCircles
            .filter(not(miss))
            .map(this.moveCircle);
        //circles that missed
        const missCircles = s.movingCircles.filter(miss);
        return {
            ...s,
            time: this.tick,
            playNotes: [], //reset playNotes every tick
            movingCircles: movingCircles,
            removeCircles: missCircles,
            multiplier: missCircles.length > 0 ? 1 : s.multiplier, //reset multiplier if miss
            combo: missCircles.length > 0 ? 0 : s.combo, //reset combo if miss
        };
    };
}

/**
 * The PressKey class represents the action of pressing a key on the keyboard.
 * It handles detecting if a circle is hit by the player and updates the state accordingly.
 */
class PressKey implements Action {
    /** The constructor takes a keyboard event as an argument. */
    constructor(public readonly event: KeyboardEvent) {}

    /**
     * Determines the base x and y coordinates for point for key press.
     *
     * @param event - The keyboard event triggered by the player's key press.
     * @returns The base point x and y coordinates for the key.
     */
    getBasePoint = (event: KeyboardEvent): [string, string] => {
        //retrieve base point coordinates of the pressed key
        return event.code === PlayKeys.PLAY_KEYS[0] //key H
            ? [Property.GREEN_POINT[0], Property.BASE_POINT]
            : event.code === PlayKeys.PLAY_KEYS[1] //key J
              ? [Property.RED_POINT[0], Property.BASE_POINT]
              : event.code === PlayKeys.PLAY_KEYS[2] //key K
                ? [Property.BLUE_POINT[0], Property.BASE_POINT]
                : [Property.YELLOW_POINT[0], Property.BASE_POINT]; //key L
    };

    /**
     * Checks if a circle is hit by comparing its position with the base point.
     *
     * @param circle - The circle to check for a hit.
     * @returns True if the circle is hit, false otherwise.
     */
    hitBasePoint = (circle: Circle): boolean => {
        const xBasePoint = this.getBasePoint(this.event)[0];
        const yBasePoint = this.getBasePoint(this.event)[1];
        //check if hit coordinate is within the minimum margin of the base point
        return xBasePoint === circle.xCoordinate
            ? Math.abs(Number(yBasePoint) - Number(circle.yCoordinate)) <
                  Number(Property.RADIUS)
            : false;
    };

    /**
     * Applies the key press action to the game state, updating the combo, score, and circles.
     *
     * @param s - The current state of the game.
     * @returns The new state after applying the key press action.
     */
    apply = (s: State): State => {
        //circles not hit
        const movingCircles = s.movingCircles.filter(not(this.hitBasePoint));
        //circles hit on point
        const hitCircles = s.movingCircles.filter(this.hitBasePoint);
        //calculates new multiplier based on the combo count
        const multiplier =
            1 + Math.floor((s.combo + hitCircles.length) / 10) * 0.2;
        return hitCircles.length > 0
            ? {
                  //circles is hit
                  ...s,
                  //proper note to be played
                  playNotes: hitCircles.map((circle) => circle.note),
                  movingCircles: movingCircles,
                  removeCircles: hitCircles,
                  multiplier: multiplier,
                  combo: s.combo + hitCircles.length, //accumulate combo
                  score: Math.round(s.score + hitCircles.length * multiplier), //calculate score with multiplier
              }
            : {
                  //circles is not hit or miss
                  ...s,
                  playNotes: [getRandomNote(s.time)], //random note to be played if miss
                  multiplier: 1, //reset multiplier if miss
                  combo: 0, //reset combo if miss
              };
    };
}

/**
 * The PlayNote class represents the action of playing a note in the game.
 * It handles spawning new circles on the screen based on the note's properties.
 */
class PlayNote implements Action {
    /** The constructor takes a note as an argument. */
    constructor(public readonly note: Note) {}

    /**
     * Retrieve info about the circle associated with the note.
     *
     * @param note - The note to be played.
     * @returns Circle info on the x-coordinate and style for the circle associated with the note.
     */
    circleInfo = (note: Note) => {
        const column = Number(note.pitch) % 4;
        return column === 0
            ? Property.GREEN_POINT
            : column === 1
              ? Property.RED_POINT
              : column === 2
                ? Property.BLUE_POINT
                : Property.YELLOW_POINT;
    };

    /**
     * Applies the play note action to the game state, creating a new circle to play or just background music to play.
     *
     * @param s - The current state of the game.
     * @returns The new state after applying the play note action.
     */
    apply = (s: State): State => {
        const xCoordinate = this.circleInfo(this.note)[0];
        const style = this.circleInfo(this.note)[1];
        return this.note.user_played
            ? {
                  //for player to play note
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
                  //for background to play note
                  ...s,
                  playNotes: [this.note],
              };
    };
}

/**
 * The EndNote class represents the action of ending the game.
 * It handles the logic for transitioning the game state to a game over screen.
 */
class EndNote implements Action {
    /**
     * The constructor is empty since no specific data is needed to end the game.
     */
    constructor() {}

    /**
     * Applies the end action to the game state, setting the gameEnd flag to true.
     *
     * @param s - The current state of the game.
     * @returns The new state with the gameEnd flag set to true.
     */
    apply = (s: State): State => {
        return {
            ...s,
            gameEnd: true, //end the game
        };
    };
}

export { initialState, Tick, PlayNote, PressKey, EndNote };
