import {GPUEngine} from "../common/GPUEngine";
import {Buffer} from "../common/Buffer";
import {Particles} from "./Particles";
import {Vec2d} from "./Vec2d";
import {Camera} from "./Camera";
import {MouseTracker} from "../common/MouseTracker";

export interface EngineSettings
{
    maxParticleCount: number;
    maxMaterialCount: number;
    gridSizeX: number;
    gridSizeY: number;
    cellSize: number;
    subStepCount: number;
    deltaTime: number;
    gravity: Vec2d;
    debug: boolean; // debug to ui or console
    performance: boolean; // measure performance
}

export interface SettingsGpuData
{
    particleCount: number,
    gridSizeX: number,
    gridSizeY: number,
    cellSize: number;
    subStepCount: number,
    deltaTime: number;
    gravityX: number;
    gravityY: number;
    mouseX: number;
    mouseY: number;
}

export class EngineSettingsBuffer
{
    public buffer: Buffer;
    public settings: EngineSettings;
    private particles: Particles;
    public gpuData: SettingsGpuData;
    private mouseTracker: MouseTracker;

    readonly intData: Uint32Array;
    readonly floatData: Float32Array;
    readonly data: ArrayBuffer;

    constructor(engine: GPUEngine,
                settings: EngineSettings,
                particles: Particles,
                camera: Camera)
    {
        this.settings = settings;
        this.particles = particles;
        this.mouseTracker = new MouseTracker(camera, engine.canvas)

        const structSizeBytes = 40;
        this.buffer = engine.createBuffer("engine-settings", structSizeBytes, "uniform");
        this.data = new ArrayBuffer(structSizeBytes);

        this.intData = new Uint32Array(this.data);
        this.floatData = new Float32Array(this.data);
        this.gpuData = {particleCount: 0, gridSizeY: 0, gridSizeX: 0,
            cellSize: 0, subStepCount: 1, deltaTime: 0, gravityX: 0, gravityY: 0,
            mouseX: 0, mouseY: 0};
    }

    public write()
    {
        this.intData[0] = this.particles.count;
        this.intData[1] = this.settings.gridSizeX;
        this.intData[2] = this.settings.gridSizeY;
        this.intData[3] = this.settings.subStepCount;
        this.floatData[4] = this.settings.deltaTime / this.settings.subStepCount;
        this.floatData[5] = this.settings.cellSize;
        this.floatData[6] = Math.sign(this.settings.gravity.x) * (this.settings.gravity.x * this.settings.gravity.x);
        this.floatData[7] = Math.sign(this.settings.gravity.y) * (this.settings.gravity.y * this.settings.gravity.y);
        this.floatData[8] = this.mouseTracker.x;
        this.floatData[9] = this.mouseTracker.y;
        this.buffer.writeBuffer(this.data)
    }

    public async loadFromGpu()
    {
        const data = await this.buffer.readBuffer();
        const intData = new Int32Array(data);
        const floatData = new Float32Array(data);
        this.gpuData = {
            particleCount: intData[0],
            gridSizeX: intData[1],
            gridSizeY: intData[2],
            subStepCount: intData[3],
            deltaTime: floatData[4],
            cellSize: floatData[5],
            gravityX: floatData[6],
            gravityY: floatData[7],
            mouseX: floatData[8],
            mouseY: floatData[9],
        }
    }

    public destroy()
    {
      this.buffer.destroy();
    }
}