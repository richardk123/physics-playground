import {isPointInsideShape} from "../utils/CollisionUtils";
import {Bodies} from "../entity/Body";
import {Points} from "../entity/PointMass";

test('poin on the polygon line', () =>
{
    const shape = Bodies.rectangle(0, 0, 5, 5, 0);
    const point = Points.create(0, 0);
    expect(isPointInsideShape(point, shape)).toBe(true);
});
test('point inside', () =>
{
    const shape = Bodies.rectangle(0, 0, 5, 5, 0);
    const point = Points.create(2, -2);
    expect(isPointInsideShape(point, shape)).toBe(true);
});
test('point outside', () =>
{
    const shape = Bodies.rectangle(0, 0, 5, 5, 0);
    const point = Points.create(2, 2);
    expect(isPointInsideShape(point, shape)).toBe(false);
});