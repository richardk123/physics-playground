import {GPUEngine} from "../common/GPUEngine";
import {Buffer} from "../common/Buffer";
import {Particles} from "./Particles";

export interface EngineSettings
{
    maxParticleCount: number;
    gridSizeX: number;
    gridSizeY: number;
}

export interface SettingsGpuData
{
    particleCount: number,
    gridSizeX: number,
    gridSizeY: number,
}

export class EngineSettingsBuffer
{
    public buffer: Buffer;
    public settings: EngineSettings;
    private particles: Particles;
    public gpuData: SettingsGpuData;

    readonly intData: Uint32Array;
    readonly data: ArrayBuffer;

    constructor(engine: GPUEngine,
                settings: EngineSettings,
                particles: Particles)
    {
        this.settings = settings;
        this.particles = particles;
        const structSizeBytes = 16;
        this.buffer = engine.createBuffer("engine-settings", 16, "uniform");
        this.data = new ArrayBuffer(structSizeBytes);

        this.intData = new Uint32Array(this.data);
        this.gpuData = {particleCount: 0, gridSizeY: 0, gridSizeX: 0};
    }

    public write()
    {
        this.intData[0] = this.particles.count;
        this.intData[1] = this.settings.gridSizeX;
        this.intData[2] = this.settings.gridSizeY;
        this.intData[3] = 0;
        this.buffer.writeBuffer(this.data)
    }

    public async loadFromGpu()
    {
        const data = await this.buffer.readBuffer();
        const intData = new Int32Array(data);
        this.gpuData = {
            particleCount: intData[0],
            gridSizeX: intData[1],
            gridSizeY: intData[2],
        }
    }
}