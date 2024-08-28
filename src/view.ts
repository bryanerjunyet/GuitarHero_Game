import { State, Circle } from "./types";
import { createSvgElement } from "./util";

export const show = (elem: SVGGraphicsElement) => {
    elem.setAttribute("visibility", "visible");
    elem.parentNode!.appendChild(elem);
};

export const hide = (elem: SVGGraphicsElement) =>
    elem.setAttribute("visibility", "hidden");

export const render = (s: State, svg: SVGGraphicsElement) => {
    s.activeCircles.forEach((circle) => {
        const circleElement = createSvgElement(
            svg.namespaceURI,
            "circle",
            circle,
        );
        svg.appendChild(circleElement);
    });
};

export const updateView = (s: State, svg: SVGGraphicsElement) => {
    const updateBodyView = (circle: Circle) => {
        function createBodyView() {
            const circleElement = createSvgElement(
                svg.namespaceURI,
                "circle",
                circle,
            );
            svg.appendChild(circleElement);
            return circleElement;
        }
        const circleElement =
            document.getElementById(circle.id) || createBodyView();
        circleElement.setAttribute("cy", circle.cy);
    };

    s.activeCircles.forEach(updateBodyView);

    s.expiredCircles.forEach((circle) => {
        const circleElement = document.getElementById(circle.id)!;
        svg.removeChild(circleElement);
    });

    const score = document.getElementById("scoreText")!;
    score.textContent = String(s.score);
};

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
