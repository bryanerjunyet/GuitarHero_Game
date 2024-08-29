import { Action, State } from "./types";

/** Utility functions */
const not =
    <T>(f: (x: T) => boolean) =>
    (x: T) =>
        !f(x);
const reduceState = (s: State, action: Action) => {
    return action.apply(s);
};

export { not, reduceState };
