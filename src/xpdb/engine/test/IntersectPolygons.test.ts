import {vec2} from "gl-matrix";
import {intersectPolygons} from "../CollisionUtils2";
import {expectVecEquivalence} from "./TestUtils";

test('polygons does not intersect', () =>
{
    const polygon1 = [
        vec2.fromValues(0, 5),
        vec2.fromValues(5, 5),
        vec2.fromValues(5, 0),
        vec2.fromValues(0, 0),
    ];

    const polygon2 = [
        vec2.fromValues(10, 15),
        vec2.fromValues(15, 15),
        vec2.fromValues(15, 10),
        vec2.fromValues(10, 10),
    ];

    const result = intersectPolygons(polygon1, polygon2);
    expect(result.intersects).toBe(false);
});

test('polygons intersect', () =>
{
    const polygon1 = [
        vec2.fromValues(0, 5),
        vec2.fromValues(5, 5),
        vec2.fromValues(5, 0),
        vec2.fromValues(0, 0),
    ];

    const polygon2 = [
        vec2.fromValues(2.5, 5),
        vec2.fromValues(7.5, 5),
        vec2.fromValues(7.5, 0),
        vec2.fromValues(2.5, 0),
    ];

    const result = intersectPolygons(polygon1, polygon2);
    expect(result.intersects).toBe(true);
    expect(result.depth).toBe(2.5);
    expectVecEquivalence(result.normal!, vec2.fromValues(1, 0))
});