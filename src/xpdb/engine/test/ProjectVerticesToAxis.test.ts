import {vec2} from "gl-matrix";
import {projectVerticesToAxis} from "../CollisionUtils2";

test('geometric center', () =>
{
    const vertices = [
        vec2.fromValues(0, 5),
        vec2.fromValues(5, 5),
        vec2.fromValues(5, 0),
        vec2.fromValues(0, 0),
    ];

    const axis = vec2.fromValues(1, 0);

    const projection = projectVerticesToAxis(vertices, axis);

    expect(projection.min).toBe(0);
    expect(projection.max).toBe(5);
});