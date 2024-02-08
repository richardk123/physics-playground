import {findClosestPointOnLine, isPointInsideShape} from "../utils/CollisionUtils";
import {vec2} from "gl-matrix";

test('point above mid line', () =>
{
    const line = {start: vec2.fromValues(0, 0), end: vec2.fromValues(10, 0)};
    const point = vec2.fromValues(5, 0);
    expectVecEquivalence(findClosestPointOnLine(point, line), vec2.fromValues(5, 0));
});
test('point on start line', () =>
{
    const line = {start: vec2.fromValues(0, 0), end: vec2.fromValues(10, 0)};
    const point = vec2.fromValues(0, 0);
    expectVecEquivalence(findClosestPointOnLine(point, line), vec2.fromValues(0, 0));
});
test('point on end line', () =>
{
    const line = {start: vec2.fromValues(0, 0), end: vec2.fromValues(10, 0)};
    const point = vec2.fromValues(10, 0);
    expectVecEquivalence(findClosestPointOnLine(point, line), vec2.fromValues(10, 0));
});
test('point on mid line', () =>
{
    const line = {start: vec2.fromValues(0, 0), end: vec2.fromValues(10, 0)};
    const point = vec2.fromValues(5, 0);
    expectVecEquivalence(findClosestPointOnLine(point, line), vec2.fromValues(5, 0));
});

const expectVecEquivalence = (actual: vec2, expected: vec2) => {
    expect(JSON.stringify(expected)).toEqual(JSON.stringify(actual));
};