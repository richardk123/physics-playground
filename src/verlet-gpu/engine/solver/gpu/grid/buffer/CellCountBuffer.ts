export class CellCountBuffer
{
    public buffer: GPUBuffer;
    public bufferRead: GPUBuffer;
    private size = 0;

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
}