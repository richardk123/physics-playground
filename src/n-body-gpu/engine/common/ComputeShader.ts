import {GPUEngine, GPUMeasurement} from "./GPUEngine";
import {EngineBuffer} from "./EngineBuffer";

export interface BufferBinding
{
    bufferSupplier: () => EngineBuffer,
    type: GPUBufferBindingType;
}

export class ComputeShaderBuilder
{
    private readonly engine: GPUEngine;
    private readonly bufferBindings: BufferBinding[];
    private readonly name: string;

    constructor(engine: GPUEngine,
                name: string)
    {
        this.engine = engine;
        this.name = name;
        this.bufferBindings = [];
    }

    public addBuffer(bufferSupplier: () => EngineBuffer, type: GPUBufferBindingType): ComputeShaderBuilder
    {
        this.bufferBindings.push({bufferSupplier: bufferSupplier, type: type});
        return this;
    }

    public async build(): Promise<ComputeShader>
    {
        const code = await fetch(`/physics-playground/n-body/${this.name}.wgsl`, {cache: "no-store"})
            .then(r => r.text());
        return new ComputeShader(this.engine, code, this.name, this.bufferBindings);
    }

}
export class ComputeShader
{
    private readonly engine: GPUEngine;
    private readonly pipeline: GPUComputePipeline;
    private readonly name: string;
    private readonly bindGroupLayout: GPUBindGroupLayout;
    private readonly buffers: BufferBinding[];
    private readonly gpuMeasurement: GPUMeasurement;

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

    public dispatch(measurePerformance: boolean, x: GPUSize32, y?: GPUSize32, z?: GPUSize32)
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

        if (measurePerformance)
        {
            this.gpuMeasurement.copy(encoder);
        }

        // Finish encoding and submit the commands
        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);

        if (measurePerformance)
        {
            this.gpuMeasurement.read(encoder);
        }
    }

    public gpuTime(): number
    {
        return this.gpuMeasurement.gpuTime;
    }
}