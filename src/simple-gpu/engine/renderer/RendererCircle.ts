import {GPUEngine} from "../common/GPUEngine";
import {Camera, CameraBuffer} from "../data/Camera";
import {ParticlesBuffer} from "../data/Particles";
import {Renderer} from "./Renderer";

export class RendererCircle implements Renderer
{
    private engine: GPUEngine;

    private particlesBuffer: ParticlesBuffer;
    public cameraBuffer: CameraBuffer;

    private pipeline: GPURenderPipeline;
    private bindGroup: GPUBindGroup;

    private constructor(engine: GPUEngine,
                        shaderCode: string,
                        camera: Camera,
                        particlesBuffer: ParticlesBuffer)
    {
        this.engine = engine;
        this.cameraBuffer = new CameraBuffer(engine, camera);
        this.particlesBuffer = particlesBuffer;

        const device = engine.device;
        const presentationFormat = engine.presentationFormat;

        const bindGroupLayout = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type: "uniform",
                    }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX,
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
                { binding: 0, resource: { buffer: this.cameraBuffer.buffer.buffer }},
                { binding: 1, resource: { buffer: particlesBuffer.getCurrent().buffer.buffer }},
            ],
        });

        this.pipeline = pipeline;
        this.bindGroup = bindGroup;
    }

    static async create(engine: GPUEngine,
                        camera: Camera,
                        particlesBuffer: ParticlesBuffer)
    {
        const shaderCode = await (fetch('/physics-playground/simple-gpu/renderCircleShader.wgsl')
            .then((r) => r.text()));

        return new RendererCircle(engine, shaderCode, camera, particlesBuffer);
    }


    public render()
    {
        const device = this.engine.device;
        const context = this.engine.context;
        const pipeline = this.pipeline;
        const bindGroup = this.bindGroup;

        // camera matrices
        this.cameraBuffer.writeBuffer();

        const commandEncoder : GPUCommandEncoder = device.createCommandEncoder();
        const textureView : GPUTextureView = context.getCurrentTexture().createView();
        const renderpass : GPURenderPassEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: {r: 0, g: 0, b: 0, a: 1.0},
                loadOp: "clear",
                storeOp: "store"
            }] as GPURenderPassColorAttachment[],
        });
        renderpass.setPipeline(pipeline);
        renderpass.setBindGroup(0, bindGroup)
        renderpass.draw(3, this.particlesBuffer.particles.count);
        renderpass.end();

        device.queue.submit([commandEncoder.finish()]);
    }
}