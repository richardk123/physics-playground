import {Constraint} from "./Constraint";
import {vec2} from "gl-matrix";
import {DistanceConstraint} from "./DistanceConstraint";

export interface BodyConstraint extends Constraint
{
    distanceConstraints: DistanceConstraint[];
}

export const createBodyConstraint = (distanceConstraints: DistanceConstraint[]) =>
{
    const solve = (dt: number) =>
    {
        distanceConstraints
            .flatMap(d => d.precalculate(dt))
            .forEach(r =>
            {
                vec2.add(r.point, r.point, r.direction);
            })
    }

    return {
        solve: solve,
        type: "body-constraint",
        distanceConstraints: distanceConstraints,
    } as BodyConstraint;
}