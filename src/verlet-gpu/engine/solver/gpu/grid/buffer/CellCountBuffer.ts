export class CellCountBuffer
{
    public buffer: GPUBuffer;
    public bufferRead: GPUBuffer;
    private totalGridCellsCount: number;

    constructor(device: GPUDevice,
                totalGridCellsCount: number)
    {
        this.totalGridCellsCount = totalGridCellsCount;
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

    public copy(encoder: GPUCommandEncoder)
    {
        encoder.copyBufferToBuffer(this.buffer, 0, this.bufferRead, 0, this.totalGridCellsCount * 4);
    }

    public async read()
    {
        await this.bufferRead.mapAsync(GPUMapMode.READ);
        console.log("cellCountBuffer");

        const arr = new Int32Array(this.bufferRead.getMappedRange(0, this.totalGridCellsCount * 4));

        console.log(this.totalGridCellsCount);
        for (let y = 0; y < 12; y++)
        {
            const row = [];
            for (let x = 0; x < 12; x++)
            {
                row.push(arr[(y * 12) + x]);
            }
            console.log(row.join(" "));
        }
        this.bufferRead.unmap();
    }
}