import {vec2} from "gl-matrix";
import {findGeometricCenter} from "../CollisionUtils2";
import {expectVecEquivalence} from "./TestUtils";

test('geometric center', () =>
{
    const vertices = [
        vec2.fromValues(0, 5),
        vec2.fromValues(5, 5),
        vec2.fromValues(5, 0),
        vec2.fromValues(0, 0),
    ];

    const center = findGeometricCenter(vertices);
    expectVecEquivalence(center, vec2.fromValues(2.5, 2.5))
});