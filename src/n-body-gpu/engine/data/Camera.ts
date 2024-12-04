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
        this.buffer = engine.createBuffer("grid", 4 * 4, "uniform");
        this.camera = camera;
    }

    public writeBuffer()
    {
        const data = new Float32Array(3);
        data[0] = this.camera.x;
        data[1] = this.camera.y;
        data[2] = this.camera.zoom;
        this.buffer.writeBuffer(data)
    }

    public destroy()
    {
        this.buffer.buffer.destroy();
    }
}