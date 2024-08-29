import { map, timer } from "rxjs";
import { Circle, Note, State } from "./types";
import { getRandomNote, playRandom, Viewport } from "./util";
import * as Tone from "tone";

const updateView = (s: State, samples: { [key: string]: Tone.Sampler }) => {
    // Canvas elements
    const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
        HTMLElement;
    const preview = document.querySelector(
        "#svgPreview",
    ) as SVGGraphicsElement & HTMLElement;
    const gameover = document.querySelector("#gameOver") as SVGGraphicsElement &
        HTMLElement;
    const container = document.querySelector("#main") as HTMLElement;

    svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
    svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);

    // Text fields
    const multiplier = document.querySelector("#multiplierText") as HTMLElement;
    const scoreText = document.querySelector("#scoreText") as HTMLElement;
    const missText = document.querySelector("#missText") as HTMLElement;
    const highScoreText = document.querySelector(
        "#highScoreText",
    ) as HTMLElement;

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
     * Renders the current state to the canvas.
     *
     * In MVC terms, this updates the View using the Model.
     */
    const render = (
        renderCircles: ReadonlyArray<Circle>,
        svg: SVGGraphicsElement,
    ) => {
        // Add blocks to the main grid canvas
        const createElement = (circle: Circle) => {
            const circleElement = createSvgElement(svg.namespaceURI, "circle", {
                id: String(circle.id),
                r: circle.r,
                cx: circle.cx,
                cy: circle.cy,
                style: circle.style,
                class: circle.class,
            });
            svg.appendChild(circleElement);
            return circleElement;
        };

        renderCircles.forEach((circle) => {
            const circleElement =
                document.getElementById(String(circle.id)) ||
                createElement(circle);
            circleElement.setAttribute("cy", circle.cy);
        });
    };

    const remove = (removeCircles: ReadonlyArray<Circle>) => {
        removeCircles.forEach((circle) => {
            const circleElement = document.getElementById(String(circle.id))!;
            svg.removeChild(circleElement);
        });
    };

    const play = (playNotes: ReadonlyArray<Note>) => {
        playNotes.forEach((note) => {
            samples[note.instrument_name].triggerAttackRelease(
                Tone.Frequency(note.pitch, "midi").toNote(),
                note.end - note.start,
                undefined,
                note.velocity / 300,
            );
        });
    };

    // const miss = (renderCircles: ReadonlyArray<Circle>) => {
    //     const miss = renderCircles.filter(
    //         (circle) => Number(circle.cy) === Viewport.CANVAS_HEIGHT,
    //     );
    //     return miss.length;
    // };

    // const missing = miss(s.renderCircles);

    // if (s.wrongPress) {
    //     playRandom(getRandomNote(), samples);
    // }
    // render(s.renderCircles, svg);
    // play(s.playNotes);
    // playRandom(s.wrongNote, samples);
    // remove(s.removeCircles);

    // Play the random note if wrongPress is true
    // console.log("Wrong before", s);
    // console.log("Wrong before", s.wrongNote);
    if (s.wrongNote) {
        playRandom(getRandomNote(), samples);

        console.log("Wrong inside", s);

        // Use RxJS timer to reset the wrongPress state after a delay
        // timer(500).pipe(
        // map(() => {
        // Reset the wrongPress state after 500ms
        s = {
            ...s,
            wrongNote: false,
        };
    }
    // console.log("Wrong after", s);
    // console.log("Wrong after", s.wrongNote);

    render(s.renderCircles, svg);
    play(s.playNotes);
    remove(s.removeCircles);

    // ).subscribe();
    // } else {
    //     render(s.renderCircles, svg);
    //     play(s.playNotes);
    //     remove(s.removeCircles);
    // }

    multiplier.textContent = String(s.multiplier);
    scoreText.textContent = String(s.score);
    missText.textContent = String(s.miss);

    // missText.textContent = String(s.miss + missing);
    // console.log("Missing", s.miss);

    if (s.gameEnd) {
        show(gameover);
    } else {
        hide(gameover);
    }
};

export { updateView };
