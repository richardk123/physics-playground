import {PointMass} from "../PointMass";
import {Shape} from "../Shape";
import {Constraint} from "./Constraint";
import {
    aggregatePointsToConnectedLines,
    findClosestPointOnShape,
    isPointInsideShape,
    LineSegment
} from "../CollisionUtils";
import {vec2} from "gl-matrix";
import {findLineSegmentLineSegmentIntersection, intersectPolygons} from "../CollisionUtils2";

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
            const negDx = vec2.negate(vec2.create(), dx);

            const C = -vec2.len(dx);
            const w1 = 1 / shape1.points.map(p => p.mass).reduce((a, b) => a + b);
            const w2 = 1 / shape2.points.map(p => p.mass).reduce((a, b) => a + b);
            const w = w1 + w2;
            const lambda = C / (w + alpha);

            const shape1Segments = aggregatePointsToConnectedLines(shape1.points);
            const shape2Segments = aggregatePointsToConnectedLines(shape2.points);

            const points1 = shape1.points.filter(p => isPointInsideShape(p, shape2));
            const points2 = shape2.points.filter(p => isPointInsideShape(p, shape1));

            const lines1 = findIntersectionLines(points2, shape1Segments, dx);
            const lines2 = findIntersectionLines(points1, shape2Segments, negDx);

            // shape1 lines
            lines1.forEach(r =>
            {
                const lineSumMoveDist = vec2.scale(vec2.create(), dx, lambda * w1);
                const line = r.line;
                const intersectionPoint = r.intersection!;

                // distance from itersection point to line points
                let dl1 = vec2.distance(line.start.position, intersectionPoint);
                let dl2 = vec2.distance(line.end.position, intersectionPoint);
                let dl = dl1 + dl2;

                // move line
                const l1Move = vec2.scale(vec2.create(), lineSumMoveDist, dl2 / dl);
                vec2.add(line.start.position, line.start.position, l1Move);

                const l2Move = vec2.scale(vec2.create(), lineSumMoveDist, dl1 / dl);
                vec2.add(line.end.position, line.end.position, l2Move);
            });

            // shape2 lines
            lines2.forEach(r =>
            {
                const lineSumMoveDist = vec2.scale(vec2.create(), dx, -lambda * w2);
                const line = r.line;
                const intersectionPoint = r.intersection!;

                // distance from itersection point to line points
                let dl1 = vec2.distance(line.start.position, intersectionPoint);
                let dl2 = vec2.distance(line.end.position, intersectionPoint);
                let dl = dl1 + dl2;

                // move line
                const l1Move = vec2.scale(vec2.create(), lineSumMoveDist, dl2 / dl);
                vec2.add(line.start.position, line.start.position, l1Move);

                const l2Move = vec2.scale(vec2.create(), lineSumMoveDist, dl1 / dl);
                vec2.add(line.end.position, line.end.position, l2Move);
            });


            // update points if they are not present on lines
            points1
                .filter(p =>
                {
                    const exists = lines1.some(l =>
                    {
                        return vec2.equals(p.position, l.line.start.position) || vec2.equals(p.position, l.line.end.position);
                    });
                    return !exists;
                })
                .forEach(p =>
                {
                    vec2.add(p.position, p.position, vec2.scale(vec2.create(), dx, lambda * w1));
                });

            // update points if they are not present on lines
            points2
                .filter(p =>
                {
                    const exists = lines2.some(l =>
                    {
                        return vec2.equals(p.position, l.line.start.position) || vec2.equals(p.position, l.line.end.position);
                    });
                    return !exists;
                })
                .forEach(p =>
                {
                    vec2.add(p.position, p.position, vec2.scale(vec2.create(), dx, -lambda * w2));
                });
        }
    }

    const findIntersectionLines = (points: PointMass[], shapeSegments: LineSegment[], dx: vec2) =>
    {
        return points
            .flatMap(p =>
            {
                const nextPos = vec2.add(vec2.create(), p.position, dx);
                return shapeSegments
                    .map(ls =>
                    {
                        const intersection = findLineSegmentLineSegmentIntersection(
                            p.position,
                            nextPos,
                            ls.start.position,
                            ls.end.position);

                        return {intersection: intersection, line: ls};
                    })
                    .filter(r => r.intersection !== null);
            })
    }

    return {
        solve: solve,
        type: "shape-collision2",
        shape1: shape1,
        shape2: shape2,
    } as ShapeCollisionConstraint2
}