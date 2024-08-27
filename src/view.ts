// import { State } from "./types";

// export function render(state: State, svg: SVGSVGElement) {
//     svg.innerHTML = ""; // Clear the SVG canvas

//     state.notes.forEach((note) => {
//         const rect = document.createElementNS(
//             "http://www.w3.org/2000/svg",
//             "rect",
//         );
//         rect.setAttribute("x", note.x.toString());
//         rect.setAttribute("y", note.y.toString());
//         rect.setAttribute("width", "10");
//         rect.setAttribute("height", "20");
//         rect.setAttribute("fill", "blue");

//         svg.appendChild(rect);
//     });

//     const scoreText = document.createElementNS(
//         "http://www.w3.org/2000/svg",
//         "text",
//     );
//     scoreText.setAttribute("x", "10");
//     scoreText.setAttribute("y", "30");
//     scoreText.setAttribute("fill", "white");
//     scoreText.textContent = `Score: ${state.score}`;

//     svg.appendChild(scoreText);
// }

// import { State, Note } from "./types";
// import { createSvgElement } from "./util";

// export const mainView = (svg: SVGGraphicsElement & HTMLElement) => {
//     svg.setAttribute("height", "400");
//     svg.setAttribute("width", "200");
// };

// export const renderCircles = (svg: SVGGraphicsElement, state: State) => {
//     // Clear existing circles
//     while (svg.lastChild) {
//         svg.removeChild(svg.lastChild);
//     }
//     state.circles.forEach((circle: Note) => {
//         const circleElem = createSvgElement(svg.namespaceURI, "circle", {
//             r: circle.r.toString(),
//             cx: circle.cx,
//             cy: circle.cy.toString(),
//             style: `fill: ${circle.color}`,
//         });
//         svg.appendChild(circleElem);
//     });
// };

// export const show = (elem: SVGGraphicsElement) => {
//     elem.setAttribute("visibility", "visible");
//     elem.parentNode!.appendChild(elem);
// };

// export const hide = (elem: SVGGraphicsElement) =>
//     elem.setAttribute("visibility", "hidden");

import { State, Viewport, Note } from "./types";
import { createSvgElement } from "./util";
import * as Tone from "tone";

export const updateView =
    (
        svg: SVGGraphicsElement,
        gameover: SVGGraphicsElement,
        multiplier: HTMLElement,
        scoreText: HTMLElement,
        highScoreText: HTMLElement,
        samples: { [key: string]: Tone.Sampler },
    ) =>
    (s: State) => {
        // Clear previous notes
        svg.innerHTML = "";

        // Render notes
        s.notes.forEach((note) => {
            const circle = createSvgElement(svg.namespaceURI, "circle", {
                r: `${Note.RADIUS}`,
                cx: `${(note.column * 0.2 + 0.2) * Viewport.CANVAS_WIDTH}`,
                cy: `${note.y}`,
                style: `fill: ${getColorForColumn(note.column)}`,
                class: "shadow",
            });
            svg.appendChild(circle);
        });

        // Render game over
        if (s.gameEnd) {
            show(gameover);
        } else {
            hide(gameover);
        }

        // Update score and multiplier
        multiplier.textContent = `${s.multiplier.toFixed(1)}x`;
        scoreText.textContent = `${s.score}`;

        // Play sounds
        playNotes(s, samples);
    };

const getColorForColumn = (column: number): string => {
    const colors = ["green", "red", "blue", "yellow"];
    return colors[column] || "white";
};

const show = (elem: SVGGraphicsElement) => {
    elem.setAttribute("visibility", "visible");
    elem.parentNode!.appendChild(elem);
};

const hide = (elem: SVGGraphicsElement) =>
    elem.setAttribute("visibility", "hidden");

const playNotes = (s: State, samples: { [key: string]: Tone.Sampler }) => {
    s.notes
        .filter((note) => Math.abs(note.y - Viewport.CANVAS_HEIGHT * 0.9) < 5)
        .forEach((note) => {
            const instrument = ["violin", "piano", "bass-electric", "trumpet"][
                note.column
            ];
            if (samples[instrument]) {
                samples[instrument].triggerAttackRelease(
                    Tone.Frequency(60 + note.column * 5, "midi").toNote(),
                    note.duration,
                    undefined,
                    0.5,
                );
            }
        });
};
