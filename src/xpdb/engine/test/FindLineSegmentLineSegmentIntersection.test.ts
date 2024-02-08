import {vec2} from "gl-matrix";
import {expectVecEquivalence} from "./TestUtils";
import {findLineSegmentLineSegmentIntersection} from "../CollisionUtils2";

test('segments does not intersect', () =>
{
    const result = findLineSegmentLineSegmentIntersection(
        vec2.fromValues(0, 0),
        vec2.fromValues(10, 10),
        vec2.fromValues(10, 0),
        vec2.fromValues(20, 10)
    )
    expect(result).toBe(null);
});
test('diagonal segments intersects', () =>
{
    const result = findLineSegmentLineSegmentIntersection(
        vec2.fromValues(0, 0),
        vec2.fromValues(10, 10),
        vec2.fromValues(10, 0),
        vec2.fromValues(0, 10)
    )
    expectVecEquivalence(result!, vec2.fromValues(5, 5));
});

test('horizontal segment vertical segment intersects', () =>
{
    const result = findLineSegmentLineSegmentIntersection(
        vec2.fromValues(-10, -10),
        vec2.fromValues(10, 10),
        vec2.fromValues(5, -5),
        vec2.fromValues(5, 5),
    );
    expectVecEquivalence(result!, vec2.fromValues(5, 5));
});

test('horizontal segment vertical segment not intersects', () =>
{
    const result = findLineSegmentLineSegmentIntersection(
        vec2.fromValues(-10, -10),
        vec2.fromValues(3, 3),
        vec2.fromValues(5, -5),
        vec2.fromValues(5, 5),
    );
    expect(result).toBe(null);
});

test('vertical segment horizontal segment not intersects', () =>
{
    const result = findLineSegmentLineSegmentIntersection(
        vec2.fromValues(5, -5),
        vec2.fromValues(5, 5),
        vec2.fromValues(-10, -10),
        vec2.fromValues(3, 3),
    );
    expect(result).toBe(null);
});

test('vertical segment horizontal segment intersects', () =>
{
    const result = findLineSegmentLineSegmentIntersection(
        vec2.fromValues(5, -5),
        vec2.fromValues(5, 5),
        vec2.fromValues(-10, -10),
        vec2.fromValues(10, 10),
    );
    expectVecEquivalence(result!, vec2.fromValues(5, 5));
});

test('segments intersect at start point', () =>
{
    const result = findLineSegmentLineSegmentIntersection(
        vec2.fromValues(1, 1),
        vec2.fromValues(10, 10),
        vec2.fromValues(1, 1),
        vec2.fromValues(-3, -5)
    );
    expectVecEquivalence(result!, vec2.fromValues(1, 1));
});

test('segments intersect at end point', () =>
{
    const result = findLineSegmentLineSegmentIntersection(
        vec2.fromValues(1, 1),
        vec2.fromValues(10, 5),
        vec2.fromValues(10, 5),
        vec2.fromValues(-3, -5)
    );
    expectVecEquivalence(result!, vec2.fromValues(10, 5));
});

test('real test', () =>
{
    const result = findLineSegmentLineSegmentIntersection(
        vec2.fromValues(9, 9),
        vec2.fromValues(9, 10),
        vec2.fromValues(0, 10),
        vec2.fromValues(10, 10)
    );
    expectVecEquivalence(result!, vec2.fromValues(9, 10));
});

test('real test 2', () =>
{
    const result = findLineSegmentLineSegmentIntersection(
        vec2.fromValues(9, 9),
        vec2.fromValues(9, 10),
        vec2.fromValues(10, 0),
        vec2.fromValues(0, 0)
    );

    expect(result).toBe(null);
});