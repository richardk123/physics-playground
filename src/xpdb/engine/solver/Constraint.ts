import {PointMass} from "../PointMass";
import {createDistanceConstraint} from "./DistanceConstraint";

export type ConstraintType = "distance" | "test" | "test2";

export interface Constraint
{
    type: ConstraintType;

    solve: (dt: number) => void;
}

export class Constraints
{
    static distance(compliance: number, ...points: PointMass[])
    {
        return createDistanceConstraint(points, compliance);
    }

}