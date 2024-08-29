import { State, Circle } from "./types";
import { createSvgElement } from "./util";

export const show = (elem: SVGGraphicsElement) => {
    elem.setAttribute("visibility", "visible");
    elem.parentNode!.appendChild(elem);
};

export const hide = (elem: SVGGraphicsElement) =>
    elem.setAttribute("visibility", "hidden");

// export const render = (s: State, svg: SVGGraphicsElement) => {
//     s.activeCircles.forEach((circle) => {
//         const circleElement = createSvgElement(svg.namespaceURI, "circle", {
//             id: circle.id,
//             r: circle.r,
//             cx: String(circle.cx), // Convert to string
//             cy: String(circle.cy), // Convert to string
//             style: circle.style,
//             class: circle.class,
//         });
//         svg.appendChild(circleElement);
//     });
// };

export const render = (s: State, svg: SVGGraphicsElement) => {
    s.activeCircles.forEach((circleNote) => {
        const circleElement = createSvgElement(svg.namespaceURI, "circle", {
            id: circleNote.id,
            r: circleNote.r,
            cx: String(circleNote.cx),
            cy: String(circleNote.cy),
            style: circleNote.style,
            class: circleNote.class,
        });
        svg.appendChild(circleElement);
    });
};

export const updateView = (s: State, svg: SVGGraphicsElement) => {
    const updateBodyView = (circle: Circle) => {
        function createBodyView() {
            return createSvgElement(svg.namespaceURI, "circle", {
                id: circle.id,
                r: circle.r,
                cx: String(circle.cx), // Convert to string
                cy: String(circle.cy), // Convert to string
                style: circle.style,
                class: circle.class,
            });
        }
        const circleElement =
            document.getElementById(circle.id) || createBodyView();
        circleElement.setAttribute("cy", String(circle.cy)); // Ensure conversion to string
    };

    s.activeCircles.forEach(updateBodyView);

    s.expiredCircles.forEach((circle) => {
        const circleElement = document.getElementById(circle.id)!;
        svg.removeChild(circleElement);
    });

    // Update score
    const score = document.getElementById("scoreText")!;
    score.textContent = String(s.score);
};

// import { State, Circle, Note as NoteType } from "./types";
// import { createSvgElement } from "./util";
// import * as Tone from "tone";

// // const playNote = (note: NoteType, samples: { [key: string]: Tone.Sampler }) => {
// //     samples[note.instrument_name].triggerAttackRelease(
// //         Tone.Frequency(note.pitch, "midi").toNote(),
// //         note.end - note.start,
// //         undefined,
// //         note.velocity,
// //     );
// // };

// export const show = (elem: SVGGraphicsElement) => {
//     elem.setAttribute("visibility", "visible");
//     elem.parentNode!.appendChild(elem);
// };

// export const hide = (elem: SVGGraphicsElement) =>
//     elem.setAttribute("visibility", "hidden");

// export const render = (s: State, svg: SVGGraphicsElement) => {
//     s.activeCircles.forEach((circle) => {
//         const circleElement = createSvgElement(
//             svg.namespaceURI,
//             "circle",
//             circle,
//         );
//         svg.appendChild(circleElement);
//     });
// };

// export const updateView = (
//     s: State,
//     svg: SVGGraphicsElement,
//     // samples: { [key: string]: Tone.Sampler },
// ) => {
//     const updateBodyView = (circle: Circle) => {
//         function createBodyView() {
//             const circleElement = createSvgElement(
//                 svg.namespaceURI,
//                 "circle",
//                 circle,
//             );
//             svg.appendChild(circleElement);
//             return circleElement;
//         }
//         const circleElement =
//             document.getElementById(circle.id) || createBodyView();
//         circleElement.setAttribute("cy", circle.cy);
//     };

//     s.activeCircles.forEach(updateBodyView);

//     s.expiredCircles.forEach((circle) => {
//         const circleElement = document.getElementById(circle.id)!;
//         svg.removeChild(circleElement);
//     });

// // Play notes: background music and user-played notes
// s.notes.forEach((note: NoteType) => {
//     if (note.user_played) {
//         // Play user note if the corresponding key was pressed
//         const correspondingCircle = s.activeCircles.find(
//             (circle) =>
//                 circle.cx === getCorrespondingCX(note.pitch) &&
//                 s.expiredCircles.some(
//                     (expiredCircle) => expiredCircle.id === circle.id,
//                 ),
//         );
//         if (correspondingCircle) {
//             playNote(note, samples); // Pass 'note' instead of 's' to playNote function
//         }
//     } else {
//         playNote(note, samples); // Pass 'note' instead of 's' to playNote function
//     }
// });

// Update score
// const score = document.getElementById("scoreText")!;
// score.textContent = String(s.score);
// };

// // Helper function to get the corresponding circle X position based on pitch
// const getCorrespondingCX = (pitch: number): string => {
//     const column = pitch % 4;
//     switch (column) {
//         case 0:
//             return "20%";
//         case 1:
//             return "40%";
//         case 2:
//             return "60%";
//         case 3:
//             return "80%";
//         default:
//             return "0";
//     }
// };

// import { GameState } from "./types";

// const createSVGElement = (tag: string, attributes: { [key: string]: any }) => {
//     const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
//     for (let key in attributes) {
//         element.setAttribute(key, attributes[key]);
//     }
//     return element;
// };

// export const renderNotes = (state: GameState) => {
//     const svg = document.querySelector("#game") as SVGSVGElement;
//     svg.innerHTML = ""; // Clear previous frame

//     state.notes.forEach((note) => {
//         const noteElement = createSVGElement("rect", {
//             x: 100 * note.lane,
//             y: state.time - note.time * 100,
//             width: 80,
//             height: 20,
//             fill: note.hit ? "green" : "red",
//         });
//         svg.appendChild(noteElement);
//     });
// };

// export const renderGameOver = () => {
//     const svg = document.querySelector("#game") as SVGSVGElement;
//     svg.innerHTML = ""; // Clear game elements
//     const textElement = createSVGElement("text", {
//         x: "50%",
//         y: "50%",
//         "text-anchor": "middle",
//         "font-size": "48",
//         fill: "white",
//     });
//     textElement.textContent = "Game Over";
//     svg.appendChild(textElement);
// };

// export const renderScore = (score: number) => {
//     const scoreElement = document.querySelector("#score");
//     if (scoreElement) scoreElement.textContent = `Score: ${score}`;
// };
