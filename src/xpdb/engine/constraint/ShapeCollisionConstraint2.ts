import {PointMass} from "../PointMass";
import {Shape} from "../Shape";
import {Constraint} from "./Constraint";
import {findClosestPointOnShape, isPointInsideShape} from "../CollisionUtils";
import {vec2} from "gl-matrix";
import {intersectPolygons} from "../CollisionUtils2";

export interface ShapeCollisionConstraint2 extends Constraint
{
    shape1: Shape;
    shape2: Shape;
}

export const createShapeCollisionConstraint2 = (shape1: Shape, shape2: Shape, compliance: number) =>
{
    const solve = (dt: number) =>
    {
        const intersectionResult = intersectPolygons(
            shape1.points.map(p => p.position),
            shape2.points.map(p => p.position));

        if (intersectionResult.intersects)
        {
            const alpha = compliance / dt /dt;
            const dx = vec2.scale(vec2.create(), intersectionResult.normal!, intersectionResult.depth!);
            const C = -vec2.len(dx);
            const w1 = 1 / shape1.points.map(p => p.mass).reduce((a, b) => a + b);
            const w2 = 1 / shape2.points.map(p => p.mass).reduce((a, b) => a + b);
            const w = w1 + w2;
            const lambda = C / (w + alpha);

            shape1.points.forEach(p =>
            {
                vec2.add(p.position, p.position, vec2.scale(vec2.create(), dx, lambda * w1));
            })
            shape2.points.forEach(p =>
            {
                vec2.add(p.position, p.position, vec2.scale(vec2.create(), dx, -lambda * w2));
            })
        }

    }

    return {
        solve: solve,
        type: "shape-collision2",
        shape1: shape1,
        shape2: shape2,
    } as ShapeCollisionConstraint2
}