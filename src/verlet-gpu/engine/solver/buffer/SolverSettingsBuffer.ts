import {Vec2d} from "../../data/Vec2d";

export const DEFAULT_SOLVER_SETTINGS: SolverSettings = {
    maxParticleCount: 1000000,
    gravity: {x: 0, y: -10},
    deltaTime: 1 / 60,
    subStepCount: 4,
};

export interface SolverSettings
{
    maxParticleCount: number;
    gravity: Vec2d;
    deltaTime: number;
    subStepCount: number;
}

export class SolverSettingsBuffer
{
    public settings: SolverSettings;
    public buffer: GPUBuffer;
    readonly data: Float32Array;

    constructor(settings: SolverSettings,
                device : GPUDevice)
    {
        this.settings = settings;
        this.data = new Float32Array(4);

        this.buffer = device.createBuffer({
            label: 'solver settings buffer',
            size: 16, // deltaTime + gravity
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
    }

    public writeBuffer(device : GPUDevice)
    {
        this.data[0] = Math.sign(this.settings.gravity.x) * this.settings.gravity.x * this.settings.gravity.x;
        this.data[1] = Math.sign(this.settings.gravity.y) * this.settings.gravity.y * this.settings.gravity.y;
        this.data[2] = this.settings.deltaTime;
        this.data[3] = 0;

        device.queue.writeBuffer(this.buffer, 0, this.data);
    }
}