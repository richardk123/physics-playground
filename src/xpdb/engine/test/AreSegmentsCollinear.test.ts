import {vec2} from "gl-matrix";
import {areSegmentsCollinear} from "../utils/CollisionUtils";

test('segments collinear', () =>
{
    const line1 = {start: vec2.fromValues(1, 1), end: vec2.fromValues(3, 3)};
    const line2 = {start: vec2.fromValues(2, 1), end: vec2.fromValues(5, 4)};
    expect(areSegmentsCollinear(line1, line2)).toBe(true);
});
test('segments not collinear', () =>
{
    const line1 = {start: vec2.fromValues(1, 1), end: vec2.fromValues(3, 3)};
    const line2 = {start: vec2.fromValues(2, 1), end: vec2.fromValues(5, 3)};
    expect(areSegmentsCollinear(line1, line2)).toBe(false);
});
test('segments collinear horizontal', () =>
{
    const line1 = {start: vec2.fromValues(0, 0), end: vec2.fromValues(10, 0)};
    const line2 = {start: vec2.fromValues(0, 1), end: vec2.fromValues(10, 1)};
    expect(areSegmentsCollinear(line1, line2)).toBe(true);
});
test('segments collinear vertical', () =>
{
    const line1 = {start: vec2.fromValues(0, 0), end: vec2.fromValues(0, 10)};
    const line2 = {start: vec2.fromValues(1, 0), end: vec2.fromValues(1, 10)};
    expect(areSegmentsCollinear(line1, line2)).toBe(true);
});