import {mat4} from "gl-matrix";
import {Vec2d} from "./Vec2d";
import {GPUEngine} from "../common/GPUEngine";
import {Buffer} from "../common/Buffer";

export interface Camera
{
    translation: Vec2d;
    rotation: number;
    zoom: number;
}

export class CameraBuffer
{
    private canvas: HTMLCanvasElement;
    public camera: Camera;
    public buffer: Buffer;

    constructor(engine: GPUEngine,
                camera: Camera)
    {
        this.camera = camera;
        this.canvas = engine.canvas;
        this.buffer = engine.createBuffer("camera", 64 * 3, "uniform");
    }

    public writeBuffer()
    {
        // Compute camera matrices
        const projection = mat4.create();
        const zoom = this.camera.zoom;
        mat4.ortho(projection,
            (-this.canvas.clientWidth / 2) * zoom, (this.canvas.clientWidth / 2) * zoom,
            (-this.canvas.clientHeight / 2) * zoom, (this.canvas.clientHeight / 2) * zoom, -1000, 1000);

        const view = mat4.create();
        const tx = this.camera.translation.x;
        const ty = this.camera.translation.y;
        mat4.lookAt(view, [1, tx, ty], [0, tx, ty], [0, 0, 1]);

        const model = mat4.create();
        mat4.rotate(model, model, this.camera.rotation, [1, 0, 0]);

        this.buffer.writeBuffer(<ArrayBuffer>model, 0);
        this.buffer.writeBuffer(<ArrayBuffer>view, 64);
        this.buffer.writeBuffer(<ArrayBuffer>projection, 128);
    }
}