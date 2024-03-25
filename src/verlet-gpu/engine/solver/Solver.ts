import {Vec2d} from "../data/Vec2d";
import {SolverSettings, SolverSettingsBuffer} from "./buffer/SolverSettingsBuffer";
import {Camera} from "./buffer/CameraBuffer";
import {GPUData, initGpu} from "./gpu/GPUInit";
import {PointsBuffer} from "./buffer/PointsBuffer";
import {PostSolveComputeShader} from "./gpu/PostSolveComputeShader";
import {PreSolveComputeShader} from "./gpu/PreSolveComputeShader";
import {RenderShader} from "./gpu/RenderShader";
import {GridComputeShader} from "./gpu/grid/GridComputeShader";
import {CollisionComputeShader} from "./gpu/collision/CollisionComputeShader";


export class Solver
{
    public gpuData: GPUData;
    public simulationDuration: number = 0;

    public renderShader: RenderShader;
    private preSolveComputeShader: PreSolveComputeShader;
    private collisionComputeShader: CollisionComputeShader;
    private postSolveComputeShader: PostSolveComputeShader;
    private gridComputeShader: GridComputeShader;
    public pointsBuffer: PointsBuffer;
    public settingsBuffer: SolverSettingsBuffer;

    private constructor(gpuData: GPUData,
                        gridComputeShader: GridComputeShader,
                        renderShader: RenderShader,
                        preSolveComputeShader: PreSolveComputeShader,
                        collisionComputeShader: CollisionComputeShader,
                        postSolveComputeShader: PostSolveComputeShader,
                        pointsBuffer: PointsBuffer,
                        settingsBuffer: SolverSettingsBuffer)
    {
        this.gpuData = gpuData;
        this.gridComputeShader = gridComputeShader;
        this.renderShader = renderShader;
        this.pointsBuffer = pointsBuffer;
        this.preSolveComputeShader = preSolveComputeShader;
        this.collisionComputeShader = collisionComputeShader;
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

        const gridComputeShader = await GridComputeShader.create(gpuData, settingsBuffer, pointsBuffer);
        const collisionComputeShader = await CollisionComputeShader.create(gpuData, settingsBuffer, pointsBuffer,
            gridComputeShader.cellsCountBuffer,
            gridComputeShader.bucketBuffer);

        const preSolveComputeShader = await PreSolveComputeShader.create(gpuData, settingsBuffer, pointsBuffer);
        const postSolveComputeShader = await PostSolveComputeShader.create(gpuData, settingsBuffer, pointsBuffer);
        const renderShader = await RenderShader.create(gpuData, camera, pointsBuffer);

        return new Solver(gpuData, gridComputeShader, renderShader,
            preSolveComputeShader, collisionComputeShader, postSolveComputeShader,
            pointsBuffer, settingsBuffer);
    }

    public initStaticData()
    {
        this.pointsBuffer.writeBuffer(this.gpuData.device);
    }

    public async simulate()
    {
        const t = performance.now();
        // write buffers
        this.settingsBuffer.writeBuffer(this.gpuData.device, this.pointsBuffer.points.count);
        for (let i = 0; i < this.settingsBuffer.settings.subStepCount; i++)
        {
            if (this.settingsBuffer.settings.debug)
            {
                console.log("================================================");
            }
            await this.preSolveComputeShader.submit();
            await this.gridComputeShader.submit();
            await this.collisionComputeShader.submit();
            this.postSolveComputeShader.submit();
        }

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
