import {GPUData, initPipeline} from "./GPUPipeline";
import {BoundingBox} from "./buffer/BoundingBoxBuffer";
import {Vec2d} from "../data/Vec2d";
import {SolverSettings} from "./buffer/SolverSettingsBuffer";
import {Camera} from "./buffer/CameraBuffer";


export class Solver
{
    public gpu: GPUData;
    public simulationDuration: number = 0;

    private constructor(gpu: GPUData)
    {
        this.gpu = gpu;
    }

    static async create(canvas: HTMLCanvasElement,
                        settings: SolverSettings,
                        camera: Camera,
                        boundingBox: BoundingBox)
    {
        const gpuData = await initPipeline(canvas, settings, camera, boundingBox);
        return new Solver(gpuData);
    }

    public initStaticData()
    {
        const device = this.gpu.device;
        this.gpu.pointsBuffer.writeBuffer(device)
    }

    public simulate()
    {
        const t = performance.now();

        const device = this.gpu.device;
        const context = this.gpu.context;
        const pipeline = this.gpu.pipeline;
        const bindGroup = this.gpu.bindGroup;
        const canvas = this.gpu.canvas;

        // camera matrices
        this.gpu.cameraBuffer.writeBuffer(canvas, device);

        //command encoder: records draw commands for submission
        const commandEncoder : GPUCommandEncoder = device.createCommandEncoder();
        //texture view: image view to the color buffer in this case
        const textureView : GPUTextureView = context.getCurrentTexture().createView();
        //renderpass: holds draw commands, allocated from command encoder
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
        renderpass.draw(3, this.gpu.pointsBuffer.points.count);
        renderpass.end();

        device.queue.submit([commandEncoder.finish()]);

        this.simulationDuration = performance.now() - t;
    }

    public getSimulationSize(): Vec2d
    {
        const camera = this.gpu.cameraBuffer.camera;
        const canvas = this.gpu.canvas;
        return {x: canvas.clientWidth * camera.zoom, y: canvas.clientHeight * camera.zoom};
    }
}
