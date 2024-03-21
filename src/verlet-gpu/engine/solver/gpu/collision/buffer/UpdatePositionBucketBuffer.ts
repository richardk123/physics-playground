export class UpdatePositionBucketBuffer
{
    public buffer: GPUBuffer;
    public bufferRead: GPUBuffer;

    constructor(device: GPUDevice,
                maxPointsCount: number)
    {
        this.buffer = device.createBuffer({
            label: 'update position bucket buffer',
            size: maxPointsCount * 4 * 8 * 2,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        });

        this.bufferRead =  device.createBuffer({
            label: 'update position bucket buffer read',
            size: maxPointsCount * 4 * 8 * 2,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        });
    }

    public copy(encoder: GPUCommandEncoder, size: number)
    {
        encoder.copyBufferToBuffer(this.buffer, 0, this.bufferRead, 0, size * 4 * 8 * 2);
    }
}