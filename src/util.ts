import { Note } from "./types";

export const torusWrap = (value: number, min: number, max: number): number => {
    return value < min ? max : value > max ? min : value;
};

export const calculateScore = (streak: number, multiplier: number): number => {
    return 100 * multiplier * streak;
};

export const generateNotes = (): Note[] => {
    // Generates an array of notes with random time and lane values
    return Array.from({ length: 100 }, () => ({
        time: Math.random() * 60, // Notes spread over 60 seconds
        lane: Math.floor(Math.random() * 4), // Four lanes
    }));
};

export const updateMultiplier = (streak: number): number => {
    if (streak < 10) return 1;
    if (streak < 20) return 2;
    if (streak < 30) return 3;
    return 4;
};
