import {Constraint} from "./Constraint";
import {PointMass} from "../entity/PointMass";
import {vec2} from "gl-matrix";

export interface DistanceConstraint extends Constraint
{
    precalculate: (dt: number) => {point: vec2, direction: vec2}[];
    points: PointMass[];
}
export const createDistanceConstraint = (points: PointMass[], compliance: number) =>
{
    const restLengths: number[] = [];

    for (let i = 1; i < points.length; i++)
    {
        restLengths.push(vec2.distance(points[i].position, points[i -1].position));
    }

    const solve = (dt: number) =>
    {
        const alpha = compliance / dt /dt;

        for (let i = 1; i < points.length; i++)
        {
            const p1 = points[i - 1];
            const p2 = points[i - 0];

            const w1 = 1 / p1.mass;
            const w2 = 1 / p2.mass;
            const w = w1 + w2;

            const dx = vec2.subtract(vec2.create(), p2.position, p1.position)
            const restLength = restLengths[i - 1];
            const length = vec2.len(dx);

            const C = restLength - length;
            const lambda = C / length / (w + alpha);

            vec2.add(p1.position, p1.position, vec2.scale(vec2.create(), dx, -lambda * w1));
            vec2.add(p2.position, p2.position, vec2.scale(vec2.create(), dx, +lambda * w2));
        }
    }

    const precalculate = (dt: number) =>
    {
        const alpha = compliance / dt /dt;
        const result = [];
        for (let i = 1; i < points.length; i++)
        {
            const p1 = points[i - 1];
            const p2 = points[i - 0];

            const w1 = 1 / p1.mass;
            const w2 = 1 / p2.mass;
            const w = w1 + w2;

            const dx = vec2.subtract(vec2.create(), p2.position, p1.position)
            const restLength = restLengths[i - 1];
            const length = vec2.len(dx);

            const C = restLength - length;
            const lambda = C / length / (w + alpha);
            result.push({point: p1.position, direction: vec2.scale(vec2.create(), dx, -lambda * w1)});
            result.push({point: p2.position, direction: vec2.scale(vec2.create(), dx, +lambda * w2)});
        }

        return result;
    }

    return {
        points: points,
        solve: solve,
        type: "distance",
        precalculate: precalculate,
    } as DistanceConstraint;
}