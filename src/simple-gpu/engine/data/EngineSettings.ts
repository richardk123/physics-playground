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

    readonly floatData: Float32Array;
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

        this.floatData = new Float32Array(this.data);
        this.intData = new Uint32Array(this.data);
    }

    public write()
    {
        this.intData[0] = this.particles.count;
        this.floatData[1] = this.settings.gridSizeX;
        this.floatData[2] = this.settings.gridSizeY;
        this.floatData[3] = 0;
        this.buffer.writeBuffer(this.data)
    }

    public async read(): Promise<SettingsGpuData>
    {
        const data = await this.buffer.readBuffer();
        const floatData = new Float32Array(data);
        const intData = new Int32Array(data);
        return {
            particleCount: intData[0],
            gridSizeX: floatData[1],
            gridSizeY: floatData[2],
        }
    }
}