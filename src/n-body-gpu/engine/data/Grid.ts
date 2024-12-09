import {EngineBuffer} from "../common/EngineBuffer";
import {GPUEngine} from "../common/GPUEngine";
import {EngineSettings} from "./EngineSettings";

export class GridBuffer
{
    public buffer: EngineBuffer;
    private settings: EngineSettings;

    constructor(engine: GPUEngine, settings: EngineSettings)
    {
        this.settings = settings;
        const numberOfCells = settings.gridSizeY * settings.gridSizeX;
        this.buffer = engine.createBuffer("gridBuffer", numberOfCells * 4, "storage");
    }

    public async printGPUData()
    {
        const gpuData = await this.loadGpuData();
        console.log(`grid [`);

        for (let y = 0; y < this.settings.gridSizeY; y++)
        {
            let row = '';
            for (let x = 0; x < this.settings.gridSizeX; x++)
            {
                const index = y * this.settings.gridSizeX + x;
                row += " " + gpuData[index];
            }
            console.log(y + ": " + row);
        }
        console.log(`]`);
    }

    private async loadGpuData()
    {
        return new Uint32Array(await this.buffer.readBuffer());
    }

    public destroy()
    {
        this.buffer.buffer.destroy();
    }
}