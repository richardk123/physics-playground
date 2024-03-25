export class BucketBuffer
{
    public buffer: GPUBuffer;
    public bufferRead: GPUBuffer;
    private totalGridCellsCount: number;

    constructor(device: GPUDevice,
                totalGridCellsCount: number)
    {
        this.totalGridCellsCount = totalGridCellsCount;
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

    public copy(encoder: GPUCommandEncoder)
    {
        encoder.copyBufferToBuffer(this.buffer, 0, this.bufferRead, 0, this.totalGridCellsCount * 4 * 8);
    }

    public async read()
    {
        await this.bufferRead.mapAsync(GPUMapMode.READ);
        console.log("bucketBuffer")

        const arr = new Int32Array(this.bufferRead.getMappedRange(0, this.totalGridCellsCount * 4 * 8));
        console.log(this.totalGridCellsCount * 8);
        for (let y = 0; y < 12; y++)
        {
            const row = [];
            for (let x = 0; x < 12; x++)
            {
                for (let i = 0; i < 8; i++)
                {
                    row.push(arr[((y * 12) + x) * 8 + i]);
                }
            }
            console.log(row.join(" "));
        }

        this.bufferRead.unmap();
    }
}