import {vec2} from "gl-matrix";
import {PointMass} from "./PointMass";
import {Shape} from "./Shape";

export const findClosestPointOnLine = (point: vec2, start: vec2, end: vec2): vec2 =>
{
    const lineDirection = vec2.subtract(vec2.create(), end, start);
    const pointToStart = vec2.subtract(vec2.create(), point, start);
    const t = vec2.dot(pointToStart, lineDirection) / vec2.squaredLength(lineDirection);
    const tClamped = Math.max(0, Math.min(1, t)); // Clamp t to [0, 1] to ensure it's within the line segment

    return vec2.scaleAndAdd(vec2.create(), start, lineDirection, tClamped);
}

export const isPointInsideShape = (point: PointMass, shape: Shape): boolean =>
{
    const shapePoints = shape.points;
    const numVertices = shapePoints.length;
    let inside = false;

    for (let i = 0, j = numVertices - 1; i < numVertices; j = i++) {
        const xi = shapePoints[i].position[0];
        const yi = shapePoints[i].position[1];
        const xj = shapePoints[j].position[0];
        const yj = shapePoints[j].position[1];

        const intersect =
            (yi >= point.position[1]) !== (yj >= point.position[1]) &&
            point.position[0] <= ((xj - xi) * (point.position[1] - yi)) / (yj - yi) + xi;

        if (intersect) {
            inside = !inside;
        }
    }

    return inside;
};

interface LineSegment {
    start: PointMass;
    end: PointMass;
}

export const aggregatePointsToConnectedLines = (points: PointMass[]): LineSegment[] =>
{
    const lines: LineSegment[] = [];

    for (let i = 0; i < points.length - 1; i++) {
        const lineStart = points[i];
        const lineEnd = points[i + 1];
        lines.push({ start: lineStart, end: lineEnd});
    }

    // Connect the last line's end to the first line's start to close the loop
    if (points.length > 1) {
        const firstPoint = points[0];
        const lastPoint = points[points.length - 1];
        lines.push({ start: lastPoint, end: firstPoint});
    }

    return lines;
}

interface ClosestPoint
{
    intersectionPoint: vec2;
    line: LineSegment;
    distance: number;
}

export const findClosestPointOnShape = (point: PointMass, shape: Shape): ClosestPoint =>
{
    const lines = aggregatePointsToConnectedLines(shape.points);

    const test = lines
        .map(line =>
        {
            const closestPoint = findClosestPointOnLine(point.position, line.start.position, line.end.position);
            return {intersectionPoint: closestPoint, line: line, distance: vec2.distance(point.position, closestPoint)} as ClosestPoint;
        });

    return test.reduce((a, b) =>
        {
            if (a.distance < b.distance)
            {
                return a as ClosestPoint;
            }
            return b as ClosestPoint;
        })
}