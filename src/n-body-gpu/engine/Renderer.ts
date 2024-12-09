import {GPUEngine, GPUMeasurement} from "./common/GPUEngine";
import {GridBuffer} from "./data/Grid";
import {PrefixSum2dBuffer} from "./data/PrefixSum2d";
import {EngineSettingsBuffer} from "./data/EngineSettings";

export interface Renderer
{
    render(): void;
    cpuTime: () => number;
    gpuTime: () => number;
    destroy: () => void;
}


export class GridRenderer implements Renderer
{
    private engine: GPUEngine;

    private gridBuffer: GridBuffer;
    private engineSettingsBuffer: EngineSettingsBuffer;
    private prefixSum2dBuffer: PrefixSum2dBuffer;

    private pipeline: GPURenderPipeline;
    private bindGroup: GPUBindGroup;
    private cpuMsPerFrame = 0;
    private gpuMeasurement: GPUMeasurement;

    private constructor(engine: GPUEngine,
                        shaderCode: string,
                        gridBuffer: GridBuffer,
                        engineSettingsBuffer: EngineSettingsBuffer,
                        prefixSum2dBuffer: PrefixSum2dBuffer)
    {
        this.engine = engine;
        this.gridBuffer = gridBuffer;
        this.engineSettingsBuffer = engineSettingsBuffer;
        this.prefixSum2dBuffer = prefixSum2dBuffer;

        const device = engine.device;
        const presentationFormat = engine.presentationFormat;

        this.gpuMeasurement = engine.createGPUMeasurement();

        const bindGroupLayout = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: "read-only-storage",
                    }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: "uniform",
                    }
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: "read-only-storage",
                    }
                },
            ] as GPUBindGroupLayoutEntry[]
        });

        const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        });

        const module = device.createShaderModule({
            code: shaderCode
        });

        const pipeline = device.createRenderPipeline({
            label: 'triangle with uniforms',
            layout: pipelineLayout,
            vertex: {
                module,
                entryPoint: 'vs',
            },
            fragment: {
                module,
                entryPoint: 'fs',
                targets: [{ format: presentationFormat }],
            },
        });

        const bindGroup = device.createBindGroup({
            label: 'triangle bind group',
            layout: bindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this.gridBuffer.buffer.buffer }},
                { binding: 1, resource: { buffer: this.engineSettingsBuffer.buffer.buffer }},
                { binding: 2, resource: { buffer: this.prefixSum2dBuffer.buffer.buffer }},
            ],
        });

        this.pipeline = pipeline;
        this.bindGroup = bindGroup;
    }

    static async create(engine: GPUEngine,
                        gridBuffer: GridBuffer,
                        engineSettingsBuffer: EngineSettingsBuffer,
                        prefixSumBuffer2d: PrefixSum2dBuffer)
    {
        const shaderCode = await (fetch('/physics-playground/n-body/renderer.wgsl')
            .then((r) => r.text()));

        return new GridRenderer(engine, shaderCode, gridBuffer, engineSettingsBuffer, prefixSumBuffer2d);
    }


    public render()
    {
        const now = performance.now();

        const device = this.engine.device;
        const context = this.engine.context;
        const pipeline = this.pipeline;
        const bindGroup = this.bindGroup;
        const canvas = this.engine.canvas;

        // Lookup the size the browser is displaying the canvas in CSS pixels.
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.max(1, Math.min(rect.width, device.limits.maxTextureDimension2D));
        canvas.height = Math.max(1, Math.min(rect.height, device.limits.maxTextureDimension2D));

        const commandEncoder : GPUCommandEncoder = device.createCommandEncoder();
        const textureView : GPUTextureView = context.getCurrentTexture().createView();
        const renderpass : GPURenderPassEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: {r: 0, g: 0, b: 0, a: 1.0},
                loadOp: "clear",
                storeOp: "store"
            }] as GPURenderPassColorAttachment[],
            ...this.gpuMeasurement.writesDescriptor()
        });

        renderpass.setPipeline(pipeline);
        renderpass.setBindGroup(0, bindGroup)
        renderpass.draw(6); // 2 triangles for a full-screen quad
        renderpass.end();

        // if (this.engine.settings.performance)
        // {
        //     this.gpuMeasurement.copy(commandEncoder);
        // }

        device.queue.submit([commandEncoder.finish()]);

        // if (this.engine.settings.performance)
        // {
        //     this.gpuMeasurement.read(commandEncoder);
        // }

        this.cpuMsPerFrame = performance.now() - now;
    }

    public cpuTime(): number
    {
        return this.cpuMsPerFrame;
    }

    public gpuTime(): number
    {
        return this.gpuMeasurement.gpuTime;
    }

    public destroy(): void
    {
    }
}