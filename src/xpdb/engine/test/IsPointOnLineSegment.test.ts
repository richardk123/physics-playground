import {isPointOnLineSegment} from "../utils/CollisionUtils";
import {vec2} from "gl-matrix";

test('point on start', () =>
{
    const line = {start: vec2.fromValues(0, 0), end: vec2.fromValues(10, 10)};
    const point = vec2.fromValues(0, 0);
    expect(isPointOnLineSegment(point, line)).toBe(true);
});
test('point on end', () =>
{
    const line = {start: vec2.fromValues(0, 0), end: vec2.fromValues(10, 10)};
    const point = vec2.fromValues(10, 10);
    expect(isPointOnLineSegment(point, line)).toBe(true);
});
test('point in middle', () =>
{
    const line = {start: vec2.fromValues(0, 0), end: vec2.fromValues(10, 10)};
    const point = vec2.fromValues(5, 5);
    expect(isPointOnLineSegment(point, line)).toBe(true);
});
test('point outside', () =>
{
    const line = {start: vec2.fromValues(0, 0), end: vec2.fromValues(10, 10)};
    const point = vec2.fromValues(10, 5);
    expect(isPointOnLineSegment(point, line)).toBe(false);
});