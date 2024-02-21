import {Constraint} from "./Constraint";
import {PointMass} from "../entity/PointMass";
import {vec2} from "gl-matrix";

export interface DistanceConstraint2 extends Constraint
{
    p1: PointMass,
    p2: PointMass,
    active: () => boolean,
}


export const createDistanceConstraint2 = (p1: PointMass, p2: PointMass, breakThreshold: number, compliance: number) =>
{
    const restLength = vec2.distance(p1.position, p2.position);
    let active = true;

    const solve = (dt: number) =>
    {
        if (active)
        {
            const alpha = compliance / dt /dt;

            const w1 = 1 / p1.mass;
            const w2 = 1 / p2.mass;
            const w = w1 + w2;

            const dx = vec2.subtract(vec2.create(), p2.position, p1.position)
            const length = vec2.len(dx);

            const C = restLength - length;
            const lambda = C / length / (w + alpha);

            if (Math.abs(C) / restLength > breakThreshold)
            {
                active = false;
            }

            if (lambda !== 0)
            {
                vec2.add(p1.position, p1.position, vec2.scale(vec2.create(), dx, -lambda * w1));
                vec2.add(p2.position, p2.position, vec2.scale(vec2.create(), dx, +lambda * w2));
            }
        }
    }

    return {
        p1: p1,
        p2: p2,
        active: () => active,
        solve: solve,
        type: "distance2",
    } as DistanceConstraint2;
}