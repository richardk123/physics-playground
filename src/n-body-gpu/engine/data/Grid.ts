import {EngineBuffer} from "../common/EngineBuffer";
import {GPUEngine} from "../common/GPUEngine";
import {EngineSettings} from "./EngineSettings";

export class GridBuffer
{
    public buffer: EngineBuffer;
    private readonly numberOfCells: number;

    constructor(engine: GPUEngine, settings: EngineSettings)
    {
        this.numberOfCells = settings.gridSizeY * settings.gridSizeX;
        this.buffer = engine.createBuffer("grid", this.numberOfCells * 4, "storage");
    }

    public destroy()
    {
        this.buffer.buffer.destroy();
    }
}