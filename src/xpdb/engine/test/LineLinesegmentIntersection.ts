import {vec2} from "gl-matrix";
import {findIntersectionPointOfLineAndLineSegment} from "../utils/CollisionUtils";

test('line linesegment intersection line segment vertical', () =>
{
    const line = {start: vec2.fromValues(0, 0), end: vec2.fromValues(1, 0)};
    const lineSegment = {start: vec2.fromValues(5, 5), end: vec2.fromValues(5, -5)};

    const intersectionPoint = findIntersectionPointOfLineAndLineSegment(line, lineSegment);
    expectVecEquivalence(intersectionPoint.point!, vec2.fromValues(5, 0));
});

test('line linesegment intersection line segment start', () =>
{
    const line = {start: vec2.fromValues(0, 0), end: vec2.fromValues(1, 0)};
    const lineSegment = {start: vec2.fromValues(0, 0), end: vec2.fromValues(5, -5)};

    const intersectionPoint = findIntersectionPointOfLineAndLineSegment(line, lineSegment);
    expectVecEquivalence(intersectionPoint.point!, vec2.fromValues(0, 0));
});

test('line linesegment intersection line segment end', () =>
{
    const line = {start: vec2.fromValues(0, 0), end: vec2.fromValues(1, 0)};
    const lineSegment = {start: vec2.fromValues(5, 5), end: vec2.fromValues(1, 0)};

    const intersectionPoint = findIntersectionPointOfLineAndLineSegment(line, lineSegment);
    expectVecEquivalence(intersectionPoint.point!, vec2.fromValues(1, 0));
});

test('line linesegment intersection real example', () =>
{
    const line = {start: vec2.fromValues(50, 5.02), end: vec2.fromValues(50, 4.94)};
    const lineSegment = {start: vec2.fromValues(40, 5), end: vec2.fromValues(90, 5)};

    const intersectionPoint = findIntersectionPointOfLineAndLineSegment(line, lineSegment);
    expectVecEquivalence(intersectionPoint.point!, vec2.fromValues(50, 5));
});

test('line linesegment intersection line segment collinear vertical', () =>
{
    const line = {start: vec2.fromValues(0, 0), end: vec2.fromValues(0, 1)};
    const lineSegment = {start: vec2.fromValues(0, 0), end: vec2.fromValues(0, 1)};

    const intersectionPoint = findIntersectionPointOfLineAndLineSegment(line, lineSegment);
    expect(intersectionPoint.collinear).toBe(true);
});

test('line linesegment intersection line segment collinear horizontal', () =>
{
    const line = {start: vec2.fromValues(0, 0), end: vec2.fromValues(1, 0)};
    const lineSegment = {start: vec2.fromValues(0, 0), end: vec2.fromValues(10, 0)};

    const intersectionPoint = findIntersectionPointOfLineAndLineSegment(line, lineSegment);
    expect(intersectionPoint.collinear).toBe(true);
});

const expectVecEquivalence = (actual: vec2, expected: vec2) => {
    expect(JSON.stringify(expected)).toEqual(JSON.stringify(actual));
};