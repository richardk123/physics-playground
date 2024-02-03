import {vec2} from "gl-matrix";
import {areSegmentsOnSameLine, findClosestPointOnLine} from "../CollisionUtils";

test('segments on same line', () =>
{
    const line1 = {start: vec2.fromValues(0, 0), end: vec2.fromValues(10, 0)};
    const line2 = {start: vec2.fromValues(1, 0), end: vec2.fromValues(5, 0)};
    expect(areSegmentsOnSameLine(line1, line2)).toBe(true);
});

test('segments not on same line', () =>
{
    const line1 = {start: vec2.fromValues(0, 0), end: vec2.fromValues(10, 0)};
    const line2 = {start: vec2.fromValues(1, 1), end: vec2.fromValues(5, 0)};
    expect(areSegmentsOnSameLine(line1, line2)).toBe(false);
});

test('two vertical segments on same line', () =>
{
    const line1 = {start: vec2.fromValues(0, 10), end: vec2.fromValues(0, 0)};
    const line2 = {start: vec2.fromValues(0, 5), end: vec2.fromValues(0, 5)};
    expect(areSegmentsOnSameLine(line1, line2)).toBe(true);
});

test('two vertical segments not on same line', () =>
{
    const line1 = {start: vec2.fromValues(0, 10), end: vec2.fromValues(0, 0)};
    const line2 = {start: vec2.fromValues(5, 1), end: vec2.fromValues(3, 1)};
    expect(areSegmentsOnSameLine(line1, line2)).toBe(false);
});

test('real example false', () =>
{
    const line1 = {start: vec2.fromValues(40, 0), end: vec2.fromValues(40, 5)};
    const line2 = {start: vec2.fromValues(50, 4.90), end: vec2.fromValues(50, 5.09)};
    expect(areSegmentsOnSameLine(line1, line2)).toBe(false);
});

test('real example true', () =>
{
    const line1 = {start: vec2.fromValues(40, 0), end: vec2.fromValues(40, 5)};
    const line2 = {start: vec2.fromValues(40, 4.90), end: vec2.fromValues(40, 5.09)};
    expect(areSegmentsOnSameLine(line1, line2)).toBe(true);
});