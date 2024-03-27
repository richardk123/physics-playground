import {GPUEngine} from "./GPUEngine";
export type BufferType = "uniform" | "storage";

export class Buffer
{
    private engine: GPUEngine;
    public readonly buffer: GPUBuffer;
    private bufferRead: GPUBuffer;
    private name: string;

    constructor(engine: GPUEngine,
                name: string,
                size: GPUSize64,
                type: BufferType)
    {
        this.engine = engine;
        this.name = name;

        const device = engine.device;
        const usage = () =>
        {
            switch (type)
            {
                case "uniform": return GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST;
                case "storage": return GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST;
                default: throw new Error("unknown buffer type");
            }
        }
        this.buffer = device.createBuffer({
            label: `${name} buffer`,
            size: size,
            usage: usage(),
        });
        this.bufferRead = device.createBuffer({
            label: `${name} buffer read`,
            size: size,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        });
    }

    public writeBuffer(data: BufferSource,
                       bufferOffset?: GPUSize64,
                       dataOffset?: GPUSize64,
                       size?: GPUSize64)
    {
        const device = this.engine.device;
        device.queue.writeBuffer(this.buffer, bufferOffset || 0, data, dataOffset, size);
    }


    public async readBuffer(): Promise<ArrayBuffer>
    {
        const device = this.engine.device;
        const encoder = device.createCommandEncoder({ label: `${this.name} builtin encoder` });

        encoder.copyBufferToBuffer(this.buffer, 0, this.bufferRead, 0, this.buffer.size);

        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);

        await this.bufferRead.mapAsync(GPUMapMode.READ);

        const buffer = this.bufferRead.getMappedRange(0, this.buffer.size);
        // Copy the buffer using slice
        const copiedBuffer = buffer.slice(0);
        this.bufferRead.unmap();

        return copiedBuffer;
    }
}