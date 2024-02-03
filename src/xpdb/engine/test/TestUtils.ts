import {vec2} from "gl-matrix";

export const expectVecEquivalence = (actual: vec2, expected: vec2) => {
    expect(JSON.stringify(expected)).toEqual(JSON.stringify(actual));
};