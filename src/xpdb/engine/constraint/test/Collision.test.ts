import {vec2} from "gl-matrix";
import {
    aggregatePointsToConnectedLines,
    isPointInsideShape,
    LineSegment
} from "../../CollisionUtils";
import {Shapes} from "../../Shape";
import {PointMass} from "../../PointMass";
import {findLineSegmentLineSegmentIntersection, intersectPolygons} from "../../CollisionUtils2";

test('intersect shape points and lines', () =>
{
    const shape1 = Shapes.rectangle(0, 10, 10, 10, 0);
    const shape2 = Shapes.rectangle(-1, 19, 10, 10, 0);

    const intersectionResult = intersectPolygons(
        shape1.points.map(p => p.position),
        shape2.points.map(p => p.position));

    const dx = vec2.scale(vec2.create(), intersectionResult.normal!, intersectionResult.depth!);
    const negDx = vec2.negate(vec2.create(), dx);
    const shape1Segments = aggregatePointsToConnectedLines(shape1.points);
    const shape2Segments = aggregatePointsToConnectedLines(shape2.points);

    const points1 = shape1.points.filter(p => isPointInsideShape(p, shape2));
    const points2 = shape2.points.filter(p => isPointInsideShape(p, shape1));

    const lines1 = findIntersectionLines(points2, shape1Segments, dx);
    const lines2 = findIntersectionLines(points1, shape2Segments, negDx);

});

const findIntersectionLines = (points: PointMass[], shapeSegments: LineSegment[], dx: vec2) =>
{
    return points
        .map(p =>
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