import {GPUData, initPipeline} from "./GPUPipeline";
import {Vec2d} from "../../../unified-particle-physics/engine/data/Vec2d";
import {Points} from "../data/Points";
import {BoundingBox} from "../data/BoundingBox";
import { mat3 } from "gl-matrix";
import {Camera} from "../data/Camera";

export interface SolverSettings
{
    pointDiameter: number;
    maxParticleCount: number;
    gravity: Vec2d;
    deltaTime: number;
    subStepCount: number;
}

export class Solver
{
    private gpu: GPUData;
    public settings: SolverSettings;
    public points: Points;
    private worldBoundingBox: BoundingBox;
    private camera: Camera;
    public simulationDuration: number = 0;

    private constructor(gpu: GPUData,
                        settings: SolverSettings)
    {
        this.gpu = gpu;
        this.settings = settings;
        this.points = Points.create(settings.maxParticleCount);
        this.worldBoundingBox = new BoundingBox({x: 0, y: 0}, {x: 100, y: 100});
        this.camera = new Camera();
    }

    static async create(canvas: HTMLCanvasElement,
                        settings: SolverSettings)
    {
        const gpuData = await initPipeline(canvas);
        return new Solver(gpuData, settings);
    }

    public simulate()
    {
        const t = performance.now();

        const device = this.gpu.device;
        const context = this.gpu.context;
        const pipeline = this.gpu.pipeline;
        const bindGroup = this.gpu.bindGroup;
        const canvas = this.gpu.canvas;

        // Compute the matrices
        mat3.create()
        var matrix = mat3.create();
        mat3.projection(matrix, canvas.clientWidth, canvas.clientHeight);
        mat3.translate(matrix, matrix, this.camera.translation);
        mat3.rotate(matrix, matrix, this.camera.rotation);
        mat3.scale(matrix, matrix, this.camera.scale);

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
        renderpass.draw(3, 1, 0, 0);
        renderpass.end();

        device.queue.submit([commandEncoder.finish()]);

        this.simulationDuration = performance.now() - t;
    }

    public getWorldBoundingBox(): BoundingBox
    {
        return this.worldBoundingBox;
    }

    public getCamera(): Camera
    {
        return this.camera;
    }
}
