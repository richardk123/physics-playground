import {BoundingBox} from "./buffer/BoundingBoxBuffer";
import {Vec2d} from "../data/Vec2d";
import {SolverSettings, SolverSettingsBuffer} from "./buffer/SolverSettingsBuffer";
import {Camera} from "./buffer/CameraBuffer";
import {GPUData, initGpu} from "./gpu/GPUInit";
import {initRenderPipeline, RenderPipeline} from "./gpu/RenderPipeline";
import {PointsBuffer} from "./buffer/PointsBuffer";
import {ComputePreSolvePipeline, initComputePreSolvePipeline} from "./gpu/ComputePreSolvePipeline";
import {ComputePostSolvePipeline, initComputePostSolvePipeline} from "./gpu/ComputePostSolvePipeline";


export class Solver
{
    public gpuData: GPUData;
    public simulationDuration: number = 0;
    public renderPipeline: RenderPipeline;
    private preSolvePipeline: ComputePreSolvePipeline;
    private postSolvePipeline: ComputePostSolvePipeline;

    public pointsBuffer: PointsBuffer;
    public settingsBuffer: SolverSettingsBuffer;

    private constructor(gpuData: GPUData,
                        renderPipeline: RenderPipeline,
                        preSolvePipeline: ComputePreSolvePipeline,
                        postSolvePipeline: ComputePostSolvePipeline,
                        pointsBuffer: PointsBuffer,
                        settingsBuffer: SolverSettingsBuffer)
    {
        this.gpuData = gpuData;
        this.renderPipeline = renderPipeline;
        this.pointsBuffer = pointsBuffer;
        this.preSolvePipeline = preSolvePipeline;
        this.settingsBuffer = settingsBuffer;
        this.postSolvePipeline = postSolvePipeline;
    }

    static async create(canvas: HTMLCanvasElement,
                        settings: SolverSettings,
                        camera: Camera,
                        boundingBox: BoundingBox)
    {

        const gpuData = await initGpu(canvas);

        const settingsBuffer = new SolverSettingsBuffer(settings, gpuData.device);
        const pointsBuffer = new PointsBuffer(settings.maxParticleCount, gpuData.device);

        const renderPipeline = await initRenderPipeline(gpuData, camera, boundingBox, pointsBuffer);
        const preSolvePipeline = await initComputePreSolvePipeline(gpuData, settingsBuffer, pointsBuffer);
        const postSolvePipeline = await initComputePostSolvePipeline(gpuData, settingsBuffer, pointsBuffer);

        return new Solver(gpuData, renderPipeline, preSolvePipeline, postSolvePipeline, pointsBuffer, settingsBuffer);
    }

    public initStaticData()
    {
        this.pointsBuffer.writeBuffer(this.gpuData.device)
    }

    public simulate()
    {
        const t = performance.now();

        // write buffers
        this.settingsBuffer.writeBuffer(this.gpuData.device);

        this.preSolve();
        this.postSolve();

        this.render();

        this.simulationDuration = performance.now() - t;
    }

    private preSolve()
    {
        const device = this.gpuData.device;
        const pipeline = this.preSolvePipeline.pipeline;
        const bindGroup = this.preSolvePipeline.bindGroup;

        // Encode commands to do the computation
        const encoder = device.createCommandEncoder({ label: 'preSolve compute builtin encoder' });
        const pass = encoder.beginComputePass({ label: 'preSolve  compute builtin pass' });

        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.dispatchWorkgroups(this.pointsBuffer.points.count);
        pass.end();

        // Finish encoding and submit the commands
        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);
    }

    private postSolve()
    {
        const device = this.gpuData.device;
        const pipeline = this.postSolvePipeline.pipeline;
        const bindGroup = this.postSolvePipeline.bindGroup;

        // Encode commands to do the computation
        const encoder = device.createCommandEncoder({ label: 'postSolve compute builtin encoder' });
        const pass = encoder.beginComputePass({ label: 'postSolve  compute builtin pass' });

        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.dispatchWorkgroups(this.pointsBuffer.points.count);
        pass.end();

        // Finish encoding and submit the commands
        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);
    }

    private render()
    {
        const device = this.gpuData.device;
        const context = this.gpuData.context;
        const pipeline = this.renderPipeline.pipeline;

        const bindGroup = this.renderPipeline.bindGroup;
        const canvas = this.gpuData.canvas;

        // camera matrices
        this.renderPipeline.cameraBuffer.writeBuffer(canvas, device);

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

    public getSimulationSize(): Vec2d
    {
        const camera = this.renderPipeline.cameraBuffer.camera;
        const canvas = this.gpuData.canvas;
        return {x: canvas.clientWidth * camera.zoom, y: canvas.clientHeight * camera.zoom};
    }
}
