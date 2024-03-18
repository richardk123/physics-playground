import {Camera, CameraBuffer} from "../buffer/CameraBuffer";
import {PointsBuffer} from "../buffer/PointsBuffer";
import {GPUData} from "./GPUInit";

export class RenderShader
{
    private gpuData: GPUData;
    public cameraBuffer: CameraBuffer;
    private pointsBuffer: PointsBuffer;
    private pipeline: GPURenderPipeline;
    private bindGroup: GPUBindGroup;

    private constructor(gpuData: GPUData,
                        shaderCode: string,
                        camera: Camera,
                        pointsBuffer: PointsBuffer)
    {
        const device = gpuData.device;

        this.gpuData = gpuData;
        this.cameraBuffer = new CameraBuffer(camera, device);

        this.pointsBuffer = pointsBuffer;
        const presentationFormat = gpuData.presentationFormat;

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
                {
                    binding: 2,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type: "read-only-storage",
                    }
                }
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
                { binding: 0, resource: { buffer: this.cameraBuffer.buffer }},
                { binding: 1, resource: { buffer: pointsBuffer.positionCurrentBuffer }},
                { binding: 2, resource: { buffer: pointsBuffer.colorBuffer }},
            ],
        });

        this.pipeline = pipeline;
        this.bindGroup = bindGroup;
    }

    static async create(gpuData: GPUData,
                        camera: Camera,
                        pointsBuffer: PointsBuffer)
    {
        const shaderCode = await (fetch('/physics-playground/renderShader.wgsl')
            .then((r) => r.text()));

        return new RenderShader(gpuData, shaderCode, camera, pointsBuffer);
    }


    public submit()
    {
        const device = this.gpuData.device;
        const context = this.gpuData.context;
        const pipeline = this.pipeline;

        const bindGroup = this.bindGroup;
        const canvas = this.gpuData.canvas;

        // camera matrices
        this.cameraBuffer.writeBuffer(canvas, device);

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
        renderpass.draw(3, this.pointsBuffer.points.count);
        renderpass.end();

        device.queue.submit([commandEncoder.finish()]);
    }
}