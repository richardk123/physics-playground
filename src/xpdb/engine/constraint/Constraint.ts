import {PointMass, Points} from "../PointMass";
import {createDistanceConstraint} from "./DistanceConstraint";
import {createShapeCollisionConstraint, ShapeCollisionConstraint} from "./ShapeCollisionConstraint";
import {Shape, Shapes} from "../Shape";
import {createShapeCollisionConstraint2, ShapeCollisionConstraint2} from "./ShapeCollisionConstraint2";

export type ConstraintType = "distance" | "shape-collision" | "shape-collision2";

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

    static shapeCollision2(shape1: Shape,
                           shape2: Shape,
                           compliance: number): ShapeCollisionConstraint2
    {
        return createShapeCollisionConstraint2(shape1, shape2, compliance);
    }

}