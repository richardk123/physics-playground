export class CellCountBuffer
{
    public buffer: GPUBuffer;
    public bufferRead: GPUBuffer;

    constructor(device: GPUDevice,
                totalGridCellsCount: number)
    {
        this.buffer = device.createBuffer({
            label: 'cell count buffer',
            size: totalGridCellsCount * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        });

        this.bufferRead = device.createBuffer({
            label: 'cell count buffer read',
            size: totalGridCellsCount * 4,
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
        console.log("cellCountBuffer")
        console.log(new Int32Array(this.bufferRead.getMappedRange(0, size * 4)));
        this.bufferRead.unmap();
    }
}