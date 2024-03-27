import {Camera} from "../data/Camera";
import {mat4, vec4} from "gl-matrix";
import {Vec2d} from "../data/Vec2d";

interface Transform
{
    position(x: number, y: number): Vec2d;
    positionVec(p: Vec2d): Vec2d;
    size(size: number): number;
}

export class Transformer
{
    private camera: Camera;
    private canvas: HTMLCanvasElement;
    private halfWidth: number;
    private halfHeight: number;

    constructor(camera: Camera,
                canvas: HTMLCanvasElement)
    {
        this.camera = camera;
        this.canvas = canvas;
        this.halfWidth = this.canvas.clientWidth / 2;
        this.halfHeight = this.canvas.clientHeight / 2;
    }

    private createCombinedMatrix(): mat4
    {
        const projection = mat4.create();
        const zoom = this.camera.zoom;

        mat4.ortho(projection,
            -this.halfWidth * zoom, this.halfWidth * zoom,
            -this.halfHeight * zoom, this.halfHeight * zoom, -1000, 1000);

        const view = mat4.create();
        const tx = this.camera.translation.x;
        const ty = this.camera.translation.y;
        mat4.lookAt(view, [-1, tx, ty], [0, tx, ty], [0, 0, -1]);

        const model = mat4.create();
        mat4.rotate(model, model, this.camera.rotation, [1, 0, 0]);

        const combinedMatrix = mat4.create();
        mat4.multiply(combinedMatrix, projection, view);
        mat4.multiply(combinedMatrix, combinedMatrix, model);
        return combinedMatrix;
    }

    public toClipSpace(): Transform
    {
        const combinedMatrix = this.createCombinedMatrix();
        const halfWidth = this.halfWidth;
        const halfHeight = this.halfHeight;
        const zoom = this.camera.zoom;

        return {
            position(x: number, y: number): Vec2d
            {
                const vertexPosVec4 = vec4.fromValues(0.0, x, y, 1.0);
                const finalPos = vec4.create();
                vec4.transformMat4(finalPos, vertexPosVec4, combinedMatrix);

                return {x: finalPos[0] * halfWidth + halfWidth, y: finalPos[1] * halfHeight + halfHeight};
            },
            positionVec(p: Vec2d): Vec2d
            {
                return this.position(p.x, p.y);
            },
            size(size: number): number
            {
                return size * (1 / zoom);
            }
        }
    }

    public toWorldSpace(): Transform
    {
        const combinedMatrix = this.createCombinedMatrix();
        const halfWidth = this.halfWidth;
        const halfHeight = this.halfHeight;
        const zoom = this.camera.zoom;

        return {
            position(x: number, y: number): Vec2d
            {
                // Calculate the inverse matrix
                const inverseMatrix = mat4.create();
                mat4.invert(inverseMatrix, combinedMatrix);

                const vertexPosVec4 = vec4.fromValues(0.0, x, y, 1.0);
                const finalPos = vec4.create();
                vec4.transformMat4(finalPos, vertexPosVec4, combinedMatrix);

                return {x: finalPos[0] * halfWidth + halfWidth, y: finalPos[1] * halfHeight + halfHeight};
            },
            positionVec(p: Vec2d): Vec2d
            {
                return this.position(p.x, p.y);
            },
            size(size: number): number
            {
                return size * zoom;
            }
        }
    }

}