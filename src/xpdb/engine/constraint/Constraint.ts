import {PointMass} from "../PointMass";
import {createDistanceConstraint} from "./DistanceConstraint";
import {createVolumeConstraint} from "./VolumeConstraint";

export type ConstraintType = "distance" | "volume";

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

    static volume(topLeftX: number,
                  topLeftY: number,
                  width: number,
                  height: number,
                  compliance: number,
                  ...points: PointMass[])
    {
        return createVolumeConstraint(topLeftX, topLeftY, width, height, compliance, points);
    }

}