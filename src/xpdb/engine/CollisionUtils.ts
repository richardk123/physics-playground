import {vec2} from "gl-matrix";
import {PointMass} from "./PointMass";
import {Shape} from "./Shape";

interface IntersectionResult
{
    collinear: boolean,
    point?: vec2;
}

interface LineSegment {
    start: PointMass;
    end: PointMass;
}

interface Line
{
    start: vec2;
    end: vec2;
}


export const isPointOnLine = (point: vec2, segment: { start: vec2, end: vec2 }): boolean => {
    const slope = (segment.end[1] - segment.start[1]) / (segment.end[0] - segment.start[0]);
    const yIntercept = segment.start[1] - slope * segment.start[0];

    return point[1] === slope * point[0] + yIntercept;
};

export const areSegmentsCollinear = (segment1: { start: vec2, end: vec2 }, segment2: { start: vec2, end: vec2 }): boolean =>
{
    const calculateSlope = (start: vec2, end: vec2): number => {
        return (end[1] - start[1]) / (end[0] - start[0]);
    };

    const slope1 = calculateSlope(segment1.start, segment1.end);
    const slope2 = calculateSlope(segment2.start, segment2.end);

    // check horizontal lines
    if (segment1.start[0] === segment1.end[0] && segment2.start[0] === segment2.end[0])
    {
        return true;
    }

    // Check if slopes are equal (considering potential floating-point precision issues)
    return Math.abs(slope1 - slope2) < 0;
}

export const areSegmentsOnSameLine = (segment1: { start: vec2, end: vec2 }, segment2: { start: vec2, end: vec2 }): boolean =>
{
    // Check if slopes are equal
    if(isPointOnLine(segment1.start, segment2) && isPointOnLine(segment1.end, segment2))
    {
        return true;
    }

    const points = [segment1.start, segment1.end, segment2.start, segment2.end];

    const xCoordinatesEqual = points.every(point => point[0] === points[0][0]);
    if (xCoordinatesEqual)
    {
        return true;
    }

    return points.every(point => point[1] === points[0][1]);

}

export const findIntersectionPointOfLineAndLineSegment = (line: Line, segment: { start: vec2, end: vec2 }): IntersectionResult =>
{
    const x1 = line.start[0];
    const y1 = line.start[1];

    const x2 = line.end[0];
    const y2 = line.end[1];

    const x3 = segment.start[0];
    const y3 = segment.start[1];

    const x4 = segment.end[0];
    const y4 = segment.end[1];

    const alpha = ((x4 - x3) * (y3 - y1) - (y4 - y3) * (x3 - x1)) / ((x4 - x3) * (y2 - y1) - (y4 - y3) * (x2 - x1));
    const beta = ((x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1)) / ((x4 - x3) * (y2 - y1) - (y4 - y3) * (x2 - x1));

    // intersecting
    if (beta >= 0 && beta <= 1)
    {
        const xi = x1 + alpha * (x2 - x1);
        const yi = y1 + alpha * (y2 - y1);
        return {point: vec2.fromValues(xi, yi), collinear: false};
    }

    // collinear
    if ((alpha === 0 && beta === 0) || (isNaN(alpha) && isNaN(beta)))
    {
        return {collinear: true};
    }

    return {collinear: false};
}

export const findClosestPointOnLine = (point: vec2, line: { start: vec2, end: vec2 }): vec2 =>
{
    const { start, end } = {start: line.start, end: line.end};

    // Calculate the direction vector of the line
    const lineDirection = vec2.subtract(vec2.create(), end, start);

    // Calculate the vector from the start point to the given point
    const pointToStart = vec2.subtract(vec2.create(), point, start);

    // Calculate the projection of pointToStart onto the lineDirection
    const t = vec2.dot(pointToStart, lineDirection) / vec2.squaredLength(lineDirection);
    const tClamped = Math.max(0, Math.min(1, t)); // Clamp t to [0, 1] to ensure it's within the line segment

    // Calculate the closest point on the line
    return vec2.scaleAndAdd(vec2.create(), start, lineDirection, tClamped);
}

export const isPointOnLineSegment = (point: vec2, segment: { start: vec2, end: vec2 }): boolean =>
{
    const x= point[0];
    const y = point[1];
    const x1 = segment.start[0];
    const y1 = segment.start[1];
    const x2 = segment.end[0];
    const y2 = segment.end[1];

    // Check if the point lies within the bounding box of the line segment
    if (
        (x >= Math.min(x1, x2) && x <= Math.max(x1, x2)) &&
        (y >= Math.min(y1, y2) && y <= Math.max(y1, y2))
    ) {
        // Check if the point is on the line using cross product
        const crossProduct = (y - y1) * (x2 - x1) - (x - x1) * (y2 - y1);

        // Allow for a small epsilon to handle floating point precision issues
        const epsilon = 1e-10;

        return Math.abs(crossProduct) < epsilon;
    }

    return false;
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

    // check if point is on the line
    if (!inside)
    {
        for (let i = 0, j = numVertices - 1; i < numVertices; j = i++) {
            const xi = shapePoints[i].position[0];
            const yi = shapePoints[i].position[1];
            const xj = shapePoints[j].position[0];
            const yj = shapePoints[j].position[1];

            const isOnLine = isPointOnLineSegment(point.position, {start: vec2.fromValues(xi, yi), end: vec2.fromValues(xj, yj)});

            if (isOnLine)
            {
                inside = true;
                break;
            }
        }
    }

    return inside;
};

export const aggregatePointsToConnectedLines = (points: PointMass[]): LineSegment[] =>
{
    const lines: LineSegment[] = [];

    for (let i = 0; i < points.length; i++) 
    {
        const lineStart = points[i];
        const lineEnd = points[(i + 1) % points.length];
        lines.push({ start: lineStart, end: lineEnd});
    }

    return lines;
}

interface ClosestPoint
{
    intersectionPoint: vec2;
    line: LineSegment;
}

export const findClosestPointOnShape = (point: PointMass, shape: Shape): ClosestPoint =>
{
    const lines = aggregatePointsToConnectedLines(shape.points);

    const result = lines
        .map(line =>
        {
            const lineVec = {start: line.start.position, end: line.end.position};
            const result = findClosestPointOnLine(point.position, lineVec);

            const distance = vec2.distance(result, point.position);
            return {intersectionPoint: result, line: line, distance: distance};
        })
        .filter(r =>
        {
            const line = r.line;
            const pointVec = {start: point.position, end: point.previousPosition};
            const lineVec = {start: line.start.position, end: line.end.position};
            return !areSegmentsCollinear(pointVec, lineVec);
        });

    return result.reduce((a, b) =>
        {
            if (a.distance < b.distance)
            {
                return a;
            }
            return b;
        }) as ClosestPoint;
}