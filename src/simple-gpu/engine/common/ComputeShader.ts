import {GPUEngine, GPUMeasurement} from "./GPUEngine";
import {Buffer} from "./Buffer";

export interface BufferBinding
{
    bufferSupplier: () => Buffer,
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

    public addBuffer(bufferSupplier: () => Buffer, type: GPUBufferBindingType): ComputeShaderBuilder
    {
        this.bufferBindings.push({bufferSupplier: bufferSupplier, type: type});
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
    private name: string;
    private bindGroupLayout: GPUBindGroupLayout;
    private buffers: BufferBinding[];
    private gpuMeasurement: GPUMeasurement;

    constructor(engine: GPUEngine,
                shaderCode: string,
                name: string,
                buffers: BufferBinding[])
    {
        this.name = name;
        this.engine = engine;
        const device : GPUDevice = engine.device;
        this.buffers = buffers;
        this.gpuMeasurement = new GPUMeasurement(engine);

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

        this.bindGroupLayout = device.createBindGroupLayout({
            entries: bindGroupLayoutEntries
        });

        const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [this.bindGroupLayout]
        });

        const module = device.createShaderModule({
            code: shaderCode
        });

        this.pipeline = device.createComputePipeline({
            label: `${name} pipeline`,
            layout: pipelineLayout,
            compute: {
                module,
                entryPoint: 'main',
            },
        });
    }

    public dispatch(x: GPUSize32, y?: GPUSize32, z?: GPUSize32)
    {
        const device = this.engine.device;
        const pipeline = this.pipeline;

        const bindGroupEntries = this.buffers
            .map((b, index) =>
            {
                return {binding: index, resource: { buffer: b.bufferSupplier().buffer }} as GPUBindGroupEntry;
            });

        const bindGroup = device.createBindGroup({
            label: `${this.name} bindGroup`,
            layout: this.bindGroupLayout,
            entries: bindGroupEntries,
        });

        // Encode commands to do the computation
        const encoder = device.createCommandEncoder({ label: `${this.name} builtin encoder` });
        const pass = encoder.beginComputePass(
            {
                label: `${this.name} compute pass`,
                ...this.gpuMeasurement.writesDescriptor()
            });

        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.dispatchWorkgroups(x, y, z);
        pass.end();

        this.gpuMeasurement.copy(encoder);
        // Finish encoding and submit the commands
        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);

        this.gpuMeasurement.read(encoder);
    }

    public gpuTime(): number
    {
        return this.gpuMeasurement.gpuTime;
    }
}