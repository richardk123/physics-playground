import {PointMass} from "../PointMass";
import {Shape} from "../Shape";
import {Constraint} from "./Constraint";
import {findClosestPointOnShape, isPointInsideShape} from "../CollisionUtils";
import {vec2} from "gl-matrix";

export interface ShapeCollisionConstraint extends Constraint
{
    shape: Shape;
}

export const createShapeCollisionConstraint = (point: PointMass, shape: Shape, compliance: number) =>
{
    const solve = (dt: number) =>
    {
        if (isPointInsideShape(point, shape))
        {
            const {intersectionPoint, line} = findClosestPointOnShape(point, shape);

            const alpha = compliance / dt /dt;
            const dx = vec2.subtract(vec2.create(), point.position, intersectionPoint);
            const C = -vec2.len(dx);
            const w1 = 1 / point.mass;
            const w2 = 1 / (line.start.mass + line.end.mass);
            const w = w1 + w2;
            const lambda = C / (w + alpha);

            // move point
            const pMove = vec2.scale(vec2.create(), dx, lambda * w1);
            vec2.add(point.position, point.position, pMove);

            // distance from itersection point to line points
            // let dl1 = vec2.distance(line.start.position, intersectionPoint);
            // let dl2 = vec2.distance(line.end.position, intersectionPoint);
            //
            // // situation when intersection point is on line point
            // if (dl1 < 10e-6 || dl2 < 10e-6)
            // {
            //     dl1 = 1;
            //     dl2 = 1;
            // }

            // const dl = dl1 + dl2;
            const lineSumMoveDist = vec2.scale(vec2.create(), dx, -lambda * w2);

            // move line
            const l1Move = vec2.scale(vec2.create(), lineSumMoveDist, 0.5);
            vec2.add(line.start.position, line.start.position, l1Move);

            const l2Move = vec2.scale(vec2.create(), lineSumMoveDist, 0.5);
            vec2.add(line.end.position, line.end.position, l2Move);
        }
    }

    return {
        solve: solve,
        type: "shape-collision",
        shape: shape,
    } as ShapeCollisionConstraint
}