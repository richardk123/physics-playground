import {GPUEngine} from "./GPUEngine";
import {Buffer} from "./Buffer";
export interface BufferBinding
{
    buffer: Buffer,
    type: GPUBufferBindingType;
}

export class ComputeShaderBuilder
{
    private engine: GPUEngine;
    private bufferBindings: BufferBinding[];
    private name: string;

    constructor(engine: GPUEngine,
                name: string)
    {
        this.engine = engine;
        this.name = name;
        this.bufferBindings = [];
    }

    public addBuffer(buffer: Buffer, type: GPUBufferBindingType): ComputeShaderBuilder
    {
        this.bufferBindings.push({buffer: buffer, type: type});
        return this;
    }

    public async build(): Promise<ComputeShader>
    {
        const code = await fetch(`/physics-playground/simple-gpu/${this.name}.wgsl`).then(r => r.text());
        return new ComputeShader(this.engine, code, this.name, this.bufferBindings);
    }

}
export class ComputeShader
{
    private engine: GPUEngine;
    private pipeline: GPUComputePipeline;
    private bindGroup: GPUBindGroup;
    private name: string;

    constructor(engine: GPUEngine,
                shaderCode: string,
                name: string,
                buffers: BufferBinding[])
    {
        this.name = name;
        this.engine = engine;
        const device : GPUDevice = engine.device;

        const bindGroupLayoutEntries = buffers
            .map((b, index) =>
            {
                return {
                    binding: index,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: b.type
                    }
                } as GPUBindGroupLayoutEntry;
            })

        const bindGroupLayout = device.createBindGroupLayout({
            entries: bindGroupLayoutEntries
        });

        const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        });

        const module = device.createShaderModule({
            code: shaderCode
        });

        const pipeline = device.createComputePipeline({
            label: `${name} pipeline`,
            layout: pipelineLayout,
            compute: {
                module,
                entryPoint: 'main',
            },
        });

        const bindGroupEntries = buffers
            .map((b, index) =>
            {
                return {binding: index, resource: { buffer: b.buffer.buffer }} as GPUBindGroupEntry;
            });

        const bindGroup = device.createBindGroup({
            label: `${name} bindGroup`,
            layout: bindGroupLayout,
            entries: bindGroupEntries,
        });

        this.pipeline = pipeline;
        this.bindGroup = bindGroup;
    }

    public dispatch(x: GPUSize32, y?: GPUSize32, z?: GPUSize32)
    {
        const device = this.engine.device;
        const pipeline = this.pipeline;
        const bindGroup = this.bindGroup;

        // Encode commands to do the computation
        const encoder = device.createCommandEncoder({ label: `${this.name} builtin encoder` });
        const pass = encoder.beginComputePass({ label: `${this.name} compute pass` });

        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.dispatchWorkgroups(x, y, z);
        pass.end();

        // Finish encoding and submit the commands
        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);
    }
}