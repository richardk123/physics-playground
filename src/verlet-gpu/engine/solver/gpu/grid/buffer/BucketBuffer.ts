export class BucketBuffer
{
    public buffer: GPUBuffer;
    public bufferRead: GPUBuffer;

    constructor(device: GPUDevice,
                totalGridCellsCount: number)
    {
        this.buffer = device.createBuffer({
            label: 'bucket buffer',
            size: totalGridCellsCount * 4 * 8,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        });

        this.bufferRead =  device.createBuffer({
            label: 'bucket buffer read',
            size: totalGridCellsCount * 4 * 8,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        });
    }


    public copy(encoder: GPUCommandEncoder, size: number)
    {
        encoder.copyBufferToBuffer(this.buffer, 0, this.bufferRead, 0, size * 4 * 8);
    }

    public async read(count: number)
    {
        await this.bufferRead.mapAsync(GPUMapMode.READ);
        console.log("bucketBuffer")
        console.log(new Int32Array(this.bufferRead.getMappedRange(0, count * 4 * 8)));
        this.bufferRead.unmap();
    }
}