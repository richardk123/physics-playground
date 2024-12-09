import {EngineBuffer} from "../common/EngineBuffer";
import {GPUEngine} from "../common/GPUEngine";

export interface EngineSettings
{
    cameraX: number;
    cameraY: number;
    zoom: number;
    gridSizeX: number;
    gridSizeY: number;
    performance: boolean; // measure performance
    debug: boolean; // debug to ui or console
}

export class EngineSettingsBuffer
{
    public buffer: EngineBuffer;
    public settings: EngineSettings;


    constructor(engine: GPUEngine,
                settings: EngineSettings)
    {
        this.buffer = engine.createBuffer("settings", 8 * 4, "uniform");
        this.settings = settings;
    }

    public writeBuffer()
    {

        const data = new ArrayBuffer(8 * 4);
        const intData = new Uint32Array(data);
        const floatData = new Float32Array(data);

        floatData[0] = this.settings.cameraX;
        floatData[1] = this.settings.cameraY;

        floatData[2] = this.settings.zoom;
        floatData[3] = 0; // offset

        intData[4] = this.settings.gridSizeX;
        intData[5] = this.settings.gridSizeY;

        this.buffer.writeBuffer(data)
    }

    public async printGPUData()
    {
        const data = await this.loadGpuData();
        console.log("EngineSettings:");
        console.log(`cameraX: ${data.floatData[0].toFixed(2)}`);
        console.log(`cameraY: ${data.floatData[1].toFixed(2)}`);
        console.log(`zoom: ${data.floatData[2].toFixed(2)}`);
        console.log(`gridSizeX: ${data.intData[4]}`);
        console.log(`gridSizeY: ${data.intData[5]}`);
    }

    private async loadGpuData()
    {
        const data = await this.buffer.readBuffer();
        return {intData: new Uint32Array(data), floatData: new Float32Array(data)};
    }

    public destroy()
    {
        this.buffer.buffer.destroy();
    }
}