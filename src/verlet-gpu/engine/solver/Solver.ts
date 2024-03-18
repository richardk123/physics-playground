import {Vec2d} from "../data/Vec2d";
import {SolverSettings, SolverSettingsBuffer} from "./buffer/SolverSettingsBuffer";
import {Camera} from "./buffer/CameraBuffer";
import {GPUData, initGpu} from "./gpu/GPUInit";
import {PointsBuffer} from "./buffer/PointsBuffer";
import {PostSolveComputeShader} from "./gpu/PostSolveComputeShader";
import {PreSolveComputeShader} from "./gpu/PreSolveComputeShader";
import {RenderShader} from "./gpu/RenderShader";


export class Solver
{
    public gpuData: GPUData;
    public simulationDuration: number = 0;
    public renderShader: RenderShader;
    private preSolveComputeShader: PreSolveComputeShader;
    private postSolveComputeShader: PostSolveComputeShader;

    public pointsBuffer: PointsBuffer;
    public settingsBuffer: SolverSettingsBuffer;

    private constructor(gpuData: GPUData,
                        renderShader: RenderShader,
                        preSolveComputeShader: PreSolveComputeShader,
                        postSolveComputeShader: PostSolveComputeShader,
                        pointsBuffer: PointsBuffer,
                        settingsBuffer: SolverSettingsBuffer)
    {
        this.gpuData = gpuData;
        this.renderShader = renderShader;
        this.pointsBuffer = pointsBuffer;
        this.preSolveComputeShader = preSolveComputeShader;
        this.settingsBuffer = settingsBuffer;
        this.postSolveComputeShader = postSolveComputeShader;
    }

    static async create(canvas: HTMLCanvasElement,
                        settings: SolverSettings,
                        camera: Camera)
    {

        const gpuData = await initGpu(canvas);

        const settingsBuffer = new SolverSettingsBuffer(settings, gpuData.device);
        const pointsBuffer = new PointsBuffer(settings.maxParticleCount, gpuData.device);

        const renderShader = await RenderShader.create(gpuData, camera, pointsBuffer);
        const preSolveComputeShader = await PreSolveComputeShader.create(gpuData, settingsBuffer, pointsBuffer);
        const postSolveComputeShader = await PostSolveComputeShader.create(gpuData, settingsBuffer, pointsBuffer);

        return new Solver(gpuData,
            renderShader, preSolveComputeShader, postSolveComputeShader,
            pointsBuffer, settingsBuffer);
    }

    public initStaticData()
    {
        this.pointsBuffer.writeBuffer(this.gpuData.device);
    }

    public simulate()
    {
        const t = performance.now();

        // write buffers
        this.settingsBuffer.writeBuffer(this.gpuData.device);

        this.preSolveComputeShader.submit();
        this.postSolveComputeShader.submit();
        this.renderShader.submit();

        this.simulationDuration = performance.now() - t;
    }

    public getSimulationSize(): Vec2d
    {
        const camera = this.renderShader.cameraBuffer.camera;
        const canvas = this.gpuData.canvas;
        return {x: canvas.clientWidth * camera.zoom, y: canvas.clientHeight * camera.zoom};
    }
}
