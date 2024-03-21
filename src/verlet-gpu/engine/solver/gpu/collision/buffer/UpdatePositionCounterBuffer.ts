export class UpdatePositionCounterBuffer
{
    public buffer: GPUBuffer;
    public bufferRead: GPUBuffer;

    constructor(device: GPUDevice,
                maxPointsCount: number)
    {
        this.buffer = device.createBuffer({
            label: 'update positiin count buffer',
            size: maxPointsCount * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        });

        this.bufferRead = device.createBuffer({
            label: 'update positiin count buffer read',
            size: maxPointsCount * 4,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        });
    }

    public copy(encoder: GPUCommandEncoder, size: number)
    {
        encoder.copyBufferToBuffer(this.buffer, 0, this.bufferRead, 0, size * 4);
    }

    public async read(size: number)
    {
        await this.bufferRead.mapAsync(GPUMapMode.READ);
        console.log("updatePositionCounterBuffer");
        console.log(new Int32Array(this.bufferRead.getMappedRange(0, size * 4)));
        this.bufferRead.unmap();
    }
}