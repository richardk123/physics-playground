import {isPointInsideShape} from "../CollisionUtils";
import {Shapes} from "../Shape";
import {Points} from "../PointMass";

test('poin on the polygon line', () =>
{
    const shape = Shapes.rectangle(0, 0, 5, 5, 0);
    const point = Points.create(0, 0);
    expect(isPointInsideShape(point, shape)).toBe(true);
});
test('point inside', () =>
{
    const shape = Shapes.rectangle(0, 0, 5, 5, 0);
    const point = Points.create(2, -2);
    expect(isPointInsideShape(point, shape)).toBe(true);
});
test('point outside', () =>
{
    const shape = Shapes.rectangle(0, 0, 5, 5, 0);
    const point = Points.create(2, 2);
    expect(isPointInsideShape(point, shape)).toBe(false);
});