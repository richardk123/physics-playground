import {PointMass} from "../entity/PointMass";
import {Constraint} from "./Constraint";
import {vec2} from "gl-matrix";
import {findClosestPointOnPolygon, isPointInsidePolygon} from "../utils/CollisionUtils2";

export interface PolygonCollisionConstraint extends Constraint
{
    polygon: vec2[]
}

export const createPolygonCollisionConstraint = (points: PointMass[], polygon: vec2[]) =>
{
    const solve = (dt: number) =>
    {
        for (let i = 0; i < points.length; i++)
        {
            const point = points[i];
            if (isPointInsidePolygon(point, polygon))
            {
                const {intersectionPoint} = findClosestPointOnPolygon(point, polygon);
                vec2.set(point.position, intersectionPoint[0], intersectionPoint[1]);
            }
        }
    }

    return {
        solve: solve,
        type: "polygon-collision",
        polygon: polygon,
    } as PolygonCollisionConstraint
}