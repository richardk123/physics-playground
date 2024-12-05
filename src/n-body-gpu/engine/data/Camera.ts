import {EngineBuffer} from "../common/EngineBuffer";
import {GPUEngine} from "../common/GPUEngine";

export type Camera = {
    x: number;
    y: number;
    zoom: number;
}

export class CameraBuffer {
    public buffer: EngineBuffer;
    public camera: Camera;


    constructor(engine: GPUEngine,
                camera: Camera)
    {
        this.buffer = engine.createBuffer("grid", 8 * 4, "uniform");
        this.camera = camera;
    }

    public writeBuffer(canvas: HTMLCanvasElement)
    {
        const data = new Float32Array(8);
        data[0] = this.camera.x;
        data[1] = this.camera.y;
        data[2] = this.camera.zoom;
        data[4] = canvas.width;
        data[5] = canvas.height;

        this.buffer.writeBuffer(data)
    }

    public destroy()
    {
        this.buffer.buffer.destroy();
    }
}