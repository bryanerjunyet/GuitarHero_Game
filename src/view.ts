/**
 * This view.ts file handles rendering the visual elements of the Guitar Hero game by updating the SVG canvas
 * based on the current state of the game. It interacts with the DOM to display moving circles,
 * plays the corresponding notes, updates the score, and handles the game over screen.
 * The updateView function serves as the primary method to refresh the game's visual state
 * by leveraging the data in the State object and Tone.js for sound playback.
 */
import { Circle, Note, State } from "./types";
import { Viewport } from "./util";
import * as Tone from "tone";

/**
 * Updates the visual representation of the game based on the current state.
 * It updates the SVG canvas, plays notes, removes circles, and manages the
 * game over display.
 *
 * @param s - The current state of the game.
 * @param samples - A collection of Tone.js samplers to play notes.
 */
const updateView = (s: State, samples: { [key: string]: Tone.Sampler }) => {
    ////////////////////// Canvas Elements //////////////////////

    /**
     * The main SVG canvas where the game circles are displayed.
     * @type {SVGGraphicsElement & HTMLElement}
     */
    const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
        HTMLElement;

    /**
     * A secondary SVG element for previewing content (currently not modified).
     * @type {SVGGraphicsElement & HTMLElement}
     */
    const preview = document.querySelector(
        "#svgPreview",
    ) as SVGGraphicsElement & HTMLElement;

    /**
     * The game over SVG element which is displayed when the game ends.
     * @type {SVGGraphicsElement & HTMLElement}
     */
    const gameover = document.querySelector("#gameOver") as SVGGraphicsElement &
        HTMLElement;

    /**
     * The main container element of the game.
     * @type {HTMLElement}
     */
    const container = document.querySelector("#main") as HTMLElement;

    /**
     * The reset button element that allows the player to restart the game.
     * @type {HTMLElement}
     */
    const resetButton = document.getElementById("resetButton")!;

    //set SVG canvas size
    svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
    svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);

    ////////////////////// Text Fields //////////////////////

    /**
     * Element displaying the current score multiplier.
     * @type {HTMLElement}
     */
    const multiplier = document.querySelector("#multiplierText") as HTMLElement;

    /**
     * Element displaying the player's current score.
     * @type {HTMLElement}
     */
    const scoreText = document.querySelector("#scoreText") as HTMLElement;

    /**
     * Element displaying the highest score.
     * @type {HTMLElement}
     */
    const highScoreText = document.querySelector(
        "#highScoreText",
    ) as HTMLElement;

    ////////////////////// View Functions //////////////////////

    /**
     * Creates an SVG element with the given properties.
     *
     * See https://developer.mozilla.org/en-US/docs/Web/SVG/Element for valid
     * element names and properties.
     *
     * @param namespace Namespace of the SVG element
     * @param name SVGElement name
     * @param props Properties to set on the SVG element
     * @returns SVG element
     */
    const createSvgElement = (
        namespace: string | null,
        name: string,
        props: Record<string, string> = {},
    ) => {
        const elem = document.createElementNS(namespace, name) as SVGElement;
        Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
        return elem;
    };

    /**
     * Displays a SVG element on the canvas. Brings to foreground.
     * @param elem SVG element to display
     */
    const show = (elem: SVGGraphicsElement) => {
        elem.setAttribute("visibility", "visible");
        elem.parentNode!.appendChild(elem);
    };

    /**
     * Hides a SVG element on the canvas.
     * @param elem SVG element to hide
     */
    const hide = (elem: SVGGraphicsElement) =>
        elem.setAttribute("visibility", "hidden");

    /**
     * Display the current state of the moving circles on the SVG canvas.
     *
     * @param movingCircles - An array of circles to be displayed on the canvas.
     * @param svg - The main SVG canvas element.
     */
    const display = (
        movingCircles: ReadonlyArray<Circle>,
        svg: SVGGraphicsElement,
    ) => {
        /**
         * Adds a circle SVG element to the main canvas.
         *
         * @param circle - The circle object representing the circle to be drawn.
         * @returns The created circle SVG element.
         */
        const addCircles = (circle: Circle) => {
            const circleElement = createSvgElement(svg.namespaceURI, "circle", {
                id: String(circle.id),
                r: circle.radius,
                cx: circle.xCoordinate,
                cy: circle.yCoordinate,
                style: circle.style,
                class: circle.class,
            });
            //add new circle element to the SVG canvas
            svg.appendChild(circleElement);
            return circleElement;
        };

        //update or add circles for each moving circle in the state
        movingCircles.forEach((circle) => {
            //find the existing circle element or create a new one
            const circleElement =
                document.getElementById(String(circle.id)) ||
                addCircles(circle);
            //update the new circle position
            circleElement.setAttribute("cy", circle.yCoordinate);
        });
    };

    /**
     * Plays the musical notes corresponding to the notes in the state.
     *
     * @param playNotes - An array of notes to be played.
     */
    const play = (playNotes: ReadonlyArray<Note>) => {
        playNotes.forEach((note) => {
            //triggers the corresponding sampler to play the note
            samples[note.instrument_name].triggerAttackRelease(
                Tone.Frequency(note.pitch, "midi").toNote(),
                note.end - note.start,
                undefined,
                note.velocity / 300,
            );
        });
    };

    /**
     * Removes circles from the canvas that are no longer present in the state.
     *
     * @param removeCircles - An array of circles to be removed from the canvas.
     */
    const remove = (removeCircles: ReadonlyArray<Circle>) => {
        removeCircles.forEach((circle) => {
            const circleElement = document.getElementById(String(circle.id))!;
            svg.removeChild(circleElement);
        });
    };

    ////////////////////// Update View //////////////////////

    display(s.movingCircles, svg);
    play(s.playNotes);
    remove(s.removeCircles);

    ////////////////////// Update Text Fields //////////////////////

    multiplier.textContent = String(s.multiplier);
    scoreText.textContent = String(s.score);
    s.gameEnd && s.movingCircles.length === 0 ? show(gameover) : hide(gameover);
};

export { updateView };
