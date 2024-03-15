import {mat4} from "gl-matrix";
import {Vec2d} from "../../data/Vec2d";

export const DEFAULT_CAMERA_SETTING: Camera = {
    translation: {x: 0, y: 0},
    rotation: 0,
    zoom: 0.00256292,
}

export interface Camera
{
    translation: Vec2d;
    rotation: number;
    zoom: number;
}

export class CameraBuffer
{
    public camera: Camera;
    public buffer: GPUBuffer;

    constructor(camera: Camera,
                device : GPUDevice)
    {
        this.camera = camera;

        this.buffer = device.createBuffer({
            label: 'camera buffer',
            size: 64 * 3,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
    }

    public writeBuffer(canvas: HTMLCanvasElement,
                       device : GPUDevice)
    {
        // Compute camera matrices
        const projection = mat4.create();
        const zoom = this.camera.zoom;
        mat4.ortho(projection,
            (-canvas.clientWidth / 2) * zoom, (canvas.clientWidth / 2) * zoom,
            (-canvas.clientHeight / 2) * zoom, (canvas.clientHeight / 2) * zoom, -1000, 1000);

        const view = mat4.create();
        const tx = this.camera.translation.x;
        const ty = this.camera.translation.y;
        mat4.lookAt(view, [1, tx, ty], [0, tx, ty], [0, 0, 1]);

        const model = mat4.create();
        mat4.rotate(model, model, this.camera.rotation, [1, 0, 0]);

        // copy the values from JavaScript to the GPU
        device.queue.writeBuffer(this.buffer, 0, <ArrayBuffer>model);
        device.queue.writeBuffer(this.buffer, 64, <ArrayBuffer>view);
        device.queue.writeBuffer(this.buffer, 128, <ArrayBuffer>projection);
    }
}