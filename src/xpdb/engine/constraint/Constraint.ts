import {PointMass, Points} from "../PointMass";
import {createDistanceConstraint} from "./DistanceConstraint";
import {createVolumeConstraint} from "./VolumeConstraint";
import {createShapeCollisionConstraint, ShapeCollisionConstraint} from "./ShapeCollisionConstraint";
import {Shape, Shapes} from "../Shape";

export type ConstraintType = "distance" | "volume" | "shape-collision";

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

    static shapeCollision(shape1: Shape,
                          shape2: Shape,
                          compliance: number): ShapeCollisionConstraint[]
    {
        const c1 = shape1.points
            .map(p =>
            {
                return createShapeCollisionConstraint(p, shape2, compliance);
            });

        const c2 = shape2.points
            .map(p =>
            {
                return createShapeCollisionConstraint(p, shape1, compliance);
            });

        return [...c1, ...c2];
    }

}