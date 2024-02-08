import {vec2} from "gl-matrix";
import {isPointOnLineSegment} from "./CollisionUtils";


export const createLineNormal = (p1: vec2, p2: vec2) =>
{
    const diff = vec2.sub(vec2.create(), p2, p1);
    const result = vec2.fromValues(-diff[1], diff[0]);
    return vec2.normalize(result, result);
}

export const findGeometricCenter = (vertices: vec2[]) =>
{
    let sumX = 0;
    let sumY = 0;

    for (let i = 0; i < vertices.length; i++)
    {
        const v = vertices[i];
        sumX += v[0];
        sumY += v[1];
    }
    return vec2.fromValues(sumX / vertices.length, sumY / vertices.length);
}

export const projectVerticesToAxis = (vertices: vec2[], axis: vec2) =>
{
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;

    for (let i = 0; i < vertices.length; i++)
    {
        const v = vertices[i];
        const proj = vec2.dot(v, axis);
        if (proj < min)
        {
            min = proj;
        }
        if (proj> max)
        {
            max = proj;
        }
    }

    return {min: min, max: max};
}

export const intersectPolygons = (polygon1: vec2[], polygon2: vec2[]) =>
{
    let normal = vec2.create();
    let depth = Number.MAX_VALUE;

    for (let i = 0; i < polygon1.length; i++)
    {
        const p1 = polygon1[i];
        const p2 = polygon1[(i + 1) % polygon1.length];
        const axis = createLineNormal(p1, p2);

        const proj1 = projectVerticesToAxis(polygon1, axis);
        const proj2 = projectVerticesToAxis(polygon2, axis);

        if (proj1.min >= proj2.max || proj2.min >= proj1.max)
        {
            return {intersects: false};
        }

        const axisDepth = Math.min(proj2.max - proj1.min, proj1.max - proj2.min);

        if (axisDepth < depth)
        {
            depth = axisDepth;
            normal = axis;
        }
    }

    for (let i = 0; i < polygon2.length; i++)
    {
        const p1 = polygon2[i];
        const p2 = polygon2[(i + 1) % polygon2.length];
        const axis = createLineNormal(p1, p2);

        const proj1 = projectVerticesToAxis(polygon1, axis);
        const proj2 = projectVerticesToAxis(polygon2, axis);

        if (proj1.min >= proj2.max || proj2.min >= proj1.max)
        {
            return {intersects: false};
        }

        const axisDepth = Math.min(proj2.max - proj1.min, proj1.max - proj2.min);

        if (axisDepth < depth)
        {
            depth = axisDepth;
            normal = axis;
        }
    }

    const center1 = findGeometricCenter(polygon1);
    const center2 = findGeometricCenter(polygon2);

    const direction = vec2.sub(vec2.create(), center2, center1);

    if (vec2.dot(direction, normal) < 0)
    {
        vec2.negate(normal, normal);
    }

    return {intersects: true, normal: normal, depth: depth};
}

export const findLineSegmentLineSegmentIntersection = (p1: vec2, p2: vec2, p3: vec2, p4: vec2): vec2 | null =>
{
    const l1Vertical = isLineSegmentVertical(p1, p2);
    const l2Vertical = isLineSegmentVertical(p3, p4);

    if (l1Vertical && l2Vertical)
    {
        return null;
    }
    else if (l1Vertical)
    {
        return findVerticalIntersection({start: p1, end: p2}, {start: p3, end: p4});
    }
    else if (l2Vertical)
    {
        return findVerticalIntersection({start: p3, end: p4}, {start: p1, end: p2});
    }

    const alpha =
        (((p4[0] - p3[0]) * (p3[1] - p1[1])) - ((p4[1] - p3[1]) * (p3[0] - p1[0]))) /
        (((p4[0] - p3[0]) * (p2[1] - p1[1])) - ((p4[1] - p3[1]) * (p2[0] - p1[0])));

    const beta =
        (((p2[0] - p1[0]) * (p3[1] - p1[1])) - ((p2[1] - p1[1]) * (p3[0] - p1[0]))) /
        (((p4[0] - p3[0]) * (p2[1] - p1[1])) - ((p4[1] - p3[1]) * (p2[0] - p1[0])));

    if (alpha >= 0 && alpha <= 1 && beta >= 0 && beta <= 1) {
        return vec2.fromValues(
            p1[0] + alpha * (p2[0] - p1[0]),
            p1[1] + alpha * (p2[1] - p1[1])
        );
    }

    return null;
}

const isLineSegmentVertical = (p1: vec2, p2: vec2) =>
{
    return p1[0] === p2[0];
}

const findVerticalIntersection = (verticalSegment: { start: vec2, end: vec2 }, nonVerticalSegment: { start: vec2, end: vec2 }): vec2 | null =>
{
    // Calculate the slope and y-intercept of the non-vertical segment
    const m1 = (nonVerticalSegment.end[1] - nonVerticalSegment.start[1]) / (nonVerticalSegment.end[0] - nonVerticalSegment.start[0]);
    const b1 = nonVerticalSegment.start[1] - m1 * nonVerticalSegment.start[0];

    // Find the x-coordinate of the intersection point
    const x = verticalSegment.start[0];

    // Use the x-coordinate to find the y-coordinate of the intersection point on the non-vertical segment
    const y = m1 * x + b1;

    // Check if the intersection point lies within the bounds of both line segments
    if (
        (y >= Math.min(verticalSegment.start[0], verticalSegment.end[1]) && y <= Math.max(verticalSegment.start[1], verticalSegment.end[1])) &&
        (x >= Math.min(nonVerticalSegment.start[0], nonVerticalSegment.end[0]) && x <= Math.max(nonVerticalSegment.start[0], nonVerticalSegment.end[0]))
    )
    {
        return vec2.fromValues(x, y);
    }
    else
    {
        return null;
    }
}

function isBetween(number: number, a: number, b: number): boolean {
    const min = Math.min(a, b);
    const max = Math.max(a, b);
    return number >= min && number <= max;
}