import {vec2} from "gl-matrix";
import {createLineNormal} from "../CollisionUtils2";
import {expectVecEquivalence} from "./TestUtils";

test('line normal horizontal', () =>
{
    const normal = createLineNormal(vec2.fromValues(0, 0), vec2.fromValues(10, 0));
    expectVecEquivalence(normal, vec2.fromValues(0, 1));
});
test('line normal vertical', () =>
{
    const normal = createLineNormal(vec2.fromValues(0, 0), vec2.fromValues(0, 10));
    expectVecEquivalence(normal, vec2.fromValues(-1, 0));
});
test('line normal diagonal', () =>
{
    const normal = createLineNormal(vec2.fromValues(0, 0), vec2.fromValues(10, 10));
    expectVecEquivalence(normal, vec2.fromValues(-0.7071067690849304, 0.7071067690849304));
});