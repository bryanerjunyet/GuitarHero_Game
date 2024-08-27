// import { Key, Note } from "./types";

// export function createNote(csvLine: string): Note {
//     const [time, key] = csvLine.split(",");
//     return {
//         time: parseFloat(time),
//         key: key as Key,
//         x: 100, // Placeholder x-coordinate
//         y: 0, // Initial y-coordinate
//         isActive: true,
//     };
// }

// export const createSvgElement = (
//     namespace: string | null,
//     name: string,
//     props: Record<string, string> = {},
// ): SVGElement => {
//     const elem = document.createElementNS(namespace, name) as SVGElement;
//     Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
//     return elem;
// };

export type Key = "KeyH" | "KeyJ" | "KeyK" | "KeyL";

export type Event = "keydown" | "keyup" | "keypress";

export const createSvgElement = (
    namespace: string | null,
    name: string,
    props: Record<string, string> = {},
) => {
    const elem = document.createElementNS(namespace, name) as SVGElement;
    Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
    return elem;
};
