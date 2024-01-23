import {vec2} from "gl-matrix";
import {Constraint} from "./Constraint";
import {PointMass} from "../PointMass";

interface Line {
    x1: number,
    y1: number,
    x2: number,
    y2: number,
}
export interface VolumeConstraint extends Constraint
{
    lines: Line[]
}
export const createVolumeConstraint = (topLeftX: number,
                                       topLeftY: number,
                                       width: number,
                                       height: number,
                                       compliance: number,
                                       points: PointMass[]) =>
{
    const l1 = {x1: topLeftX, y1: topLeftY, x2: topLeftX + width, y2: topLeftY};
    const l2 = {x1: topLeftX + width, y1: topLeftY, x2: topLeftX + width, y2: topLeftY - height};
    const l3 = {x1: topLeftX + width, y1: topLeftY - height, x2: topLeftX, y2: topLeftY - height};
    const l4 = {x1: topLeftX, y1: topLeftY - height, x2: topLeftX, y2: topLeftY};
    const lines = [l1, l2, l3, l4];

    const isPointInVolume = (point: PointMass) =>
    {
        const px = point.position[0];
        const py = point.position[1];

        return px >= topLeftX && px <= topLeftX + width &&
            py <= topLeftY && py >= topLeftY - height;

    }

    const findClosestPointOnLine = (point: vec2, start: vec2, end: vec2): vec2 =>
    {
        const lineDirection = vec2.subtract(vec2.create(), end, start);
        const pointToStart = vec2.subtract(vec2.create(), point, start);
        const t = vec2.dot(pointToStart, lineDirection) / vec2.squaredLength(lineDirection);
        const tClamped = Math.max(0, Math.min(1, t)); // Clamp t to [0, 1] to ensure it's within the line segment

        return vec2.scaleAndAdd(vec2.create(), start, lineDirection, tClamped);
    }

    const findClosestPoint = (p: PointMass) =>
    {
        return lines.map(l =>
        {
            return findClosestPointOnLine(p.position, vec2.fromValues(l.x1, l.y1), vec2.fromValues(l.x2, l.y2));
        })
        .reduce((a, b) =>
        {
            if (vec2.distance(p.position, a) < vec2.distance(p.position, b))
            {
                return a;
            }
            return b;
        });
    }

    const solve = (dt: number) =>
    {
        const alpha = compliance / dt /dt;

        points.forEach(p =>
        {
            if (isPointInVolume(p))
            {
                const closestPoint = findClosestPoint(p);

                const dx = vec2.subtract(vec2.create(), p.position, closestPoint);
                const C = -vec2.len(dx);
                const w = 1 / p.mass;
                const lambda = C / (w + alpha);

                vec2.scale(dx, dx, lambda * p.mass)
                vec2.add(p.position, p.position, dx);
            }
        })
    }

    return {
        lines: lines,
        solve: solve,
        type: "volume",
    } as VolumeConstraint
}