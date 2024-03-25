import {Vec2d} from "../../data/Vec2d";

export const DEFAULT_SOLVER_SETTINGS: SolverSettings = {
    maxParticleCount: 1000000,
    gravity: {x: 0, y: -10},
    deltaTime: 1 / 60,
    subStepCount: 8,
    gridCellSize: 1,
    boundingBox: {
        bottomLeft: {x: 0, y: 0},
        topRight: {x: 12, y: 12},
    },
    debug: false,
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
    gridCellSize: number,
    boundingBox: BoundingBox;
    debug: boolean;
}

export class SolverSettingsBuffer
{
    public settings: SolverSettings;
    public buffer: GPUBuffer;
    readonly floatData: Float32Array;
    readonly intData: Uint32Array;
    readonly data: ArrayBuffer;

    constructor(settings: SolverSettings,
                device : GPUDevice)
    {
        this.settings = settings;

        const structSizeBytes =
            4 + // gravity.x
            4 + // gravity.y
            4 + // deltaTime
            4 + // padding
            4 + // bbBottomLeft.x
            4 + // bbBottomLeft.y
            4 + // bbTopRight.x
            4 + // bbTopRight.y
            4 + // grid cell size
            4 + // points count
            4 + // grid total cell count
            4 + // grid size x
            4 + // grid size y
            4 ; // offset

        this.data = new ArrayBuffer(structSizeBytes);

        this.floatData = new Float32Array(this.data);
        this.intData = new Uint32Array(this.data);

        this.buffer = device.createBuffer({
            label: 'solver settings buffer',
            size: structSizeBytes,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
    }

    public writeBuffer(device : GPUDevice,
                       maxPointsCount: number)
    {
        this.floatData[0] = Math.sign(this.settings.gravity.x) * this.settings.gravity.x * this.settings.gravity.x;
        this.floatData[1] = Math.sign(this.settings.gravity.y) * this.settings.gravity.y * this.settings.gravity.y;
        this.floatData[2] = this.settings.deltaTime / this.settings.subStepCount;
        this.floatData[3] = 0;
        this.floatData[4] = this.settings.boundingBox.bottomLeft.x;
        this.floatData[5] = this.settings.boundingBox.bottomLeft.y;
        this.floatData[6] = this.settings.boundingBox.topRight.x;
        this.floatData[7] = this.settings.boundingBox.topRight.y;
        this.floatData[8] = this.settings.gridCellSize;
        this.intData[9] = maxPointsCount;
        this.intData[10] = this.getTotalGridCellCount();
        this.intData[11] = this.getGridSizeX();
        this.intData[12] = this.getGridSizeY();

        device.queue.writeBuffer(this.buffer, 0, this.data);
    }

    public getTotalGridCellCount()
    {
        return this.getGridSizeX() * this.getGridSizeY();
    }

    public getGridSizeX()
    {
        return Math.abs(this.settings.boundingBox.bottomLeft.x - this.settings.boundingBox.topRight.x);
    }

    public getGridSizeY()
    {
        return Math.abs(this.settings.boundingBox.bottomLeft.y - this.settings.boundingBox.topRight.y);
    }
}