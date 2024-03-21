import {Color} from "../../data/Color";

export class Points
{
    public positionCurrent: Float32Array;
    public positionPrevious: Float32Array;
    public velocity: Float32Array;
    public massInverse: Float32Array;
    public color: Float32Array;
    public count: number;

    constructor(maxParticleCount: number)
    {
        this.positionCurrent = new Float32Array(maxParticleCount * 2);
        this.positionCurrent.fill(0);
        this.positionPrevious = new Float32Array(maxParticleCount * 2);
        this.positionPrevious.fill(0)
        this.velocity = new Float32Array(maxParticleCount * 2);
        this.velocity.fill(0);
        this.massInverse = new Float32Array(maxParticleCount);
        this.massInverse.fill(0)
        this.color = new Float32Array(maxParticleCount * 4);
        this.color.fill(0);
        this.count = 0;
    }

    public addPoint(x: number, y: number, mass: number, color: Color)
    {
        const index = this.count;

        this.positionCurrent[index * 2 + 0] = x;
        this.positionCurrent[index * 2 + 1] = y;

        this.massInverse[index] = 1 / mass;

        this.color[index * 4 + 0] = color.r;
        this.color[index * 4 + 1] = color.g;
        this.color[index * 4 + 2] = color.b;
        this.color[index * 4 + 3] = color.a;

        this.count += 1;

        return index;
    }
}

export class PointsBuffer
{
    public points: Points;
    public positionCurrentBuffer: GPUBuffer;
    public positionPreviousBuffer: GPUBuffer;
    public velocityBuffer: GPUBuffer;
    public colorBuffer: GPUBuffer;
    public maxPointsCount: number;

    constructor(maxPointsCount: number, device: GPUDevice)
    {
        this.maxPointsCount = maxPointsCount;
        this.points = new Points(maxPointsCount);

        this.positionCurrentBuffer = device.createBuffer({
            label: 'points current position buffer',
            size: maxPointsCount * 2 * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });
        this.positionPreviousBuffer = device.createBuffer({
            label: 'points previous position buffer',
            size: maxPointsCount * 2 * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });
        this.velocityBuffer = device.createBuffer({
            label: 'points velocity buffer',
            size: maxPointsCount * 2 * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });
        this.colorBuffer = device.createBuffer({
            label: 'points color buffer',
            size: maxPointsCount * 4 * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });
    }

    public writeBuffer(device: GPUDevice)
    {
        device.queue.writeBuffer(this.positionCurrentBuffer, 0, this.points.positionCurrent);
        device.queue.writeBuffer(this.positionPreviousBuffer, 0, this.points.positionPrevious);
        device.queue.writeBuffer(this.velocityBuffer, 0, this.points.velocity);
        device.queue.writeBuffer(this.colorBuffer, 0, this.points.color);
    }

}