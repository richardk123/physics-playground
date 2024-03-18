import {Vec2d} from "../../data/Vec2d";

export const DEFAULT_SOLVER_SETTINGS: SolverSettings = {
    maxParticleCount: 1000000,
    gravity: {x: 0, y: -10},
    deltaTime: 1 / 60,
    subStepCount: 4,
    boundingBox: {
        bottomLeft: {x: 0, y: 0},
        topRight: {x: 100, y: 100},
    },
};


export interface BoundingBox
{
    bottomLeft: Vec2d;
    topRight: Vec2d
}

export interface SolverSettings
{
    maxParticleCount: number;
    gravity: Vec2d;
    deltaTime: number;
    subStepCount: number;
    boundingBox: BoundingBox;
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
        this.data = new Float32Array(8);

        this.buffer = device.createBuffer({
            label: 'solver settings buffer',
            size: 32, // deltaTime + gravity
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
    }

    public writeBuffer(device : GPUDevice)
    {
        this.data[0] = Math.sign(this.settings.gravity.x) * this.settings.gravity.x * this.settings.gravity.x;
        this.data[1] = Math.sign(this.settings.gravity.y) * this.settings.gravity.y * this.settings.gravity.y;
        this.data[2] = this.settings.deltaTime;
        this.data[3] = 0; // padding
        this.data[4] = this.settings.boundingBox.bottomLeft.x;
        this.data[5] = this.settings.boundingBox.bottomLeft.y;
        this.data[6] = this.settings.boundingBox.topRight.x;
        this.data[7] = this.settings.boundingBox.topRight.y;

        device.queue.writeBuffer(this.buffer, 0, this.data);
    }
}