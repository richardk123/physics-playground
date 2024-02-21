import {PointMass, Points} from "../entity/PointMass";
import {createDistanceConstraint, DistanceConstraint} from "./DistanceConstraint";
import {
    createPolygonCollisionConstraint,
    PolygonCollisionConstraint
} from "./PolygonCollisionConstraint";
import {vec2} from "gl-matrix";
import {createPointCollisionConstraint, PointCollisionConstraint} from "./PointCollisionConstraint";
import {Body} from "../entity/Body";
import {createDistanceConstraint2} from "./DistanceConstraint2";

export type ConstraintType = "distance" | "polygon-collision" | "point-collision" | "body-constraint" | "distance2";

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

    static distance2(compliance: number, threshold: number, p1: PointMass, p2: PointMass)
    {
        return createDistanceConstraint2(p1, p2, threshold, compliance);
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


    static attachBodyToRope(rope: Body, body: Body, compliance: number)
    {
        const ropePoint = rope.points[rope.points.length - 1];
        const bodyPoint = body.points[body.points.length - 1];

        return Constraints.distance(compliance, ropePoint, bodyPoint);
    }

}