import {Camera} from "../data/Camera";
import {mat4, vec4} from "gl-matrix";
import {Vec2d} from "../data/Vec2d";

export class PositionTransformer
{
    private camera: Camera;
    private canvas: HTMLCanvasElement;
    constructor(camera: Camera,
                canvas: HTMLCanvasElement)
    {
        this.camera = camera;
        this.canvas = canvas;
    }

    public pos(p: Vec2d): Vec2d
    {
        return this.position(p.x, p.y);
    }

    public position(x: number, y: number): Vec2d
    {
        const projection = mat4.create();
        const zoom = this.camera.zoom;
        const halfWidth = this.canvas.clientWidth / 2;
        const halfHeight = this.canvas.clientHeight / 2;

        mat4.ortho(projection,
            -halfWidth * zoom, halfWidth * zoom,
            -halfHeight * zoom, halfHeight * zoom, -1000, 1000);

        const view = mat4.create();
        const tx = this.camera.translation.x;
        const ty = this.camera.translation.y;
        mat4.lookAt(view, [-1, tx, ty], [0, tx, ty], [0, 0, -1]);

        const model = mat4.create();
        mat4.rotate(model, model, this.camera.rotation, [1, 0, 0]);

        const vertexPosVec4 = vec4.fromValues(0.0, x, y, 1.0);

        const transformedPos = mat4.create();
        mat4.multiply(transformedPos, projection, view);
        mat4.multiply(transformedPos, transformedPos, model);

        const finalPos = vec4.create();
        vec4.transformMat4(finalPos, vertexPosVec4, transformedPos);

        return {x: finalPos[0] * halfWidth + halfWidth, y: finalPos[1] * halfHeight + halfHeight};
    }

    public size(size: number)
    {
        return size * (1 / this.camera.zoom);
    }

}