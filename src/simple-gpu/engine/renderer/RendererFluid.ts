import {GPUEngine} from "../common/GPUEngine";
import {Camera, CameraBuffer} from "../data/Camera";
import {ParticlesBuffer} from "../data/Particles";
import {Renderer} from "./Renderer";

export class RendererFluid implements Renderer
{
    private engine: GPUEngine;

    private particlesBuffer: ParticlesBuffer;
    public cameraBuffer: CameraBuffer;

    private circlePipeline: CirclePipeline;
    private copyPipeline: CopyPipeline;

    private constructor(engine: GPUEngine,
                        circleShaderCode: string,
                        copyShaderCode: string,
                        camera: Camera,
                        particlesBuffer: ParticlesBuffer)
    {
        this.engine = engine;
        this.cameraBuffer = new CameraBuffer(engine, camera);
        this.particlesBuffer = particlesBuffer;
        this.circlePipeline = new CirclePipeline(circleShaderCode, engine, particlesBuffer, this.cameraBuffer);
        this.copyPipeline = new CopyPipeline(copyShaderCode, engine, this.circlePipeline.texture);
    }

    static async create(engine: GPUEngine,
                        camera: Camera,
                        particlesBuffer: ParticlesBuffer)
    {
        const circleShaderCode = await (fetch('/physics-playground/simple-gpu/renderFluidShader.wgsl')
            .then((r) => r.text()));
        const copyShaderCode = await (fetch('/physics-playground/simple-gpu/renderCopyShader.wgsl')
            .then((r) => r.text()));

        return new RendererFluid(engine, circleShaderCode, copyShaderCode, camera, particlesBuffer);
    }


    public render()
    {
        this.particlePass();
        this.displayFinalTexture();
    }

    private particlePass()
    {
        const device = this.engine.device;
        const pipeline = this.circlePipeline.pipeline;
        const bindGroup = this.circlePipeline.bindGroup;
        const renderTexture = this.circlePipeline.texture;

        // camera matrices
        this.cameraBuffer.writeBuffer();

        const commandEncoder : GPUCommandEncoder = device.createCommandEncoder();
        const renderpass : GPURenderPassEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: renderTexture.createView(),
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

    private displayFinalTexture()
    {
        const device = this.engine.device;
        const context = this.engine.context;
        const pipeline = this.copyPipeline.pipeline;
        const bindGroup = this.copyPipeline.bindGroup;

        const encoder = device.createCommandEncoder({
            label: 'render quad encoder',
        });
        const textureView : GPUTextureView = context.getCurrentTexture().createView();
        const pass : GPURenderPassEncoder = encoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: {r: 0, g: 0, b: 0, a: 1.0},
                loadOp: "clear",
                storeOp: "store"
            }] as GPURenderPassColorAttachment[],
        });
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.draw(6);  // call our vertex shader 6 times
        pass.end();

        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);
    }
}

class CopyPipeline
{
    public pipeline: GPURenderPipeline;
    public bindGroup: GPUBindGroup;

    constructor(shaderCode: string,
                engine: GPUEngine,
                sourceTexture: GPUTexture)
    {

        const device = engine.device;
        const presentationFormat = engine.presentationFormat;
        const module = device.createShaderModule(
            {
                label: "copy circle shader",
                code: shaderCode,
            }
        );
        const pipeline = device.createRenderPipeline({
            label: 'hardcoded textured quad pipeline',
            layout: 'auto',
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

        const sampler = device.createSampler({
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'nearest',
            minFilter: 'linear',
            mipmapFilter: 'linear'
        });

        const bindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: sampler },
                { binding: 1, resource: sourceTexture.createView() },
            ],
        });

        this.pipeline = pipeline;
        this.bindGroup = bindGroup;
    }
}

class CirclePipeline
{
    public pipeline: GPURenderPipeline;
    public bindGroup: GPUBindGroup;
    public texture: GPUTexture;

    constructor(shaderCode: string,
                engine: GPUEngine,
                particlesBuffer: ParticlesBuffer,
                cameraBuffer: CameraBuffer)
    {

        const device = engine.device;
        const presentationFormat = engine.presentationFormat;

        const bindGroupLayout= device.createBindGroupLayout({
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
            label: 'circle pipeline',
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
            label: 'circle bind group',
            layout: bindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: cameraBuffer.buffer.buffer }},
                { binding: 1, resource: { buffer: particlesBuffer.getCurrent().buffer.buffer }},
            ],
        });

        const coef = 4;
        const resolution = { width: 1980 / coef, height: 1080 / coef };
        this.texture = device.createTexture({
            size: resolution,
            format: presentationFormat,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.pipeline = pipeline;
        this.bindGroup = bindGroup;
    }
}