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

    constructor(settings: SolverSettings,
                device : GPUDevice)
    {
        this.settings = settings;

        //TODO:
        this.buffer = device.createBuffer({
            label: 'solver settings buffer',
            size: 64 * 3,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
    }

    public writeBuffer(device : GPUDevice)
    {
        //TODO:
    }
}