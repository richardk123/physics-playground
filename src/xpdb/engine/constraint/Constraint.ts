import {PointMass, Points} from "../entity/PointMass";
import {createDistanceConstraint, DistanceConstraint} from "./DistanceConstraint";
import {
    createPolygonCollisionConstraint,
    PolygonCollisionConstraint
} from "./PolygonCollisionConstraint";
import {vec2} from "gl-matrix";
import {createPointCollisionConstraint, PointCollisionConstraint} from "./PointCollisionConstraint";
import {Body} from "../entity/Body";
import {createBodyConstraint} from "./BodyConstraint";

export type ConstraintType = "distance" | "polygon-collision" | "point-collision" | "body-constraint";

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

    static polygonCollision(polygon: vec2[],
                            points: PointMass[]): PolygonCollisionConstraint
    {
        return createPolygonCollisionConstraint(points, polygon);
    }

    static pointCollision(points: PointMass[]): PointCollisionConstraint
    {
        return createPointCollisionConstraint(points);
    }

    static bodyConstraint(...distanceConstraints: DistanceConstraint[])
    {
        return createBodyConstraint(distanceConstraints);
    }

    static attachBodyToRope(rope: Body, body: Body, compliance: number)
    {
        const ropePoint = rope.points[rope.points.length - 1];
        const bodyPoint = body.points[body.points.length - 1];

        return Constraints.distance(compliance, ropePoint, bodyPoint);
    }

}