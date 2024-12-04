import {EngineBuffer} from "../common/EngineBuffer";
import {GPUEngine} from "../common/GPUEngine";

export class GridBuffer
{
    public buffer: EngineBuffer;
    public static GRID_SIZE = 2048 * 2048;

    constructor(engine: GPUEngine)
    {
        this.buffer = engine.createBuffer("grid", GridBuffer.GRID_SIZE * 4, "storage");
    }

    public destroy()
    {
        this.buffer.buffer.destroy();
    }
}