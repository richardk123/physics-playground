import {findClosestPointOnShape, isPointInsideShape} from "../CollisionUtils";
import {Shapes} from "../Shape";
import {Points} from "../PointMass";
import {vec2} from "gl-matrix";

test('poin on shape top left point', () =>
{
    const shape = Shapes.rectangle(5, 5, 5, 5, 0);
    const point = Points.create(5, 5);

    expectVecEquivalence(findClosestPointOnShape(point, shape).intersectionPoint, vec2.fromValues(5, 5));
});

test('poin on shape top bellow top left', () =>
{
    const shape = Shapes.rectangle(5, 5, 5, 5, 0);
    const point = Points.create(5, 4);

    expectVecEquivalence(findClosestPointOnShape(point, shape).intersectionPoint, vec2.fromValues(5, 5));
});

test('point inside shape', () =>
{
    const shape = Shapes.rectangle(5, 5, 5, 5, 0);
    const point = Points.create(3, 4);

    expectVecEquivalence(findClosestPointOnShape(point, shape).intersectionPoint, vec2.fromValues(3, 4));
});

const expectVecEquivalence = (actual: vec2, expected: vec2) => {
    expect(JSON.stringify(expected)).toEqual(JSON.stringify(actual));
};