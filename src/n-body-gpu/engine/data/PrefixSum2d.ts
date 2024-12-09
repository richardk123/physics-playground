import {EngineBuffer} from "../common/EngineBuffer";
import {GPUEngine} from "../common/GPUEngine";
import {GridBuffer} from "./Grid";
import {ComputeShader} from "../common/ComputeShader";
import {EngineSettings, EngineSettingsBuffer} from "./EngineSettings";

export class PrefixSum2dBuffer
{
    public buffer: EngineBuffer;
    public gpuData: Uint32Array;

    constructor(engine: GPUEngine, settings: EngineSettings)
    {
        const gridSize = settings.gridSizeX * settings.gridSizeY;
        this.buffer = engine.createBuffer("grid", gridSize * 4, "storage");
        this.gpuData = new Uint32Array(gridSize);
    }

    public async printGPU()
    {
        await this.loadGpuData();
        console.log(`prefixSum indexes [${this.gpuData.map((c, i) => i).join(", ")}]`);
    }

    private async loadGpuData()
    {
        this.gpuData = new Uint32Array(await this.buffer.readBuffer());
    }

    public destroy()
    {
        this.buffer.buffer.destroy();
    }
}

export class PrefixSum2dComputeShader
{
    public buffer: PrefixSum2dBuffer;
    public prefixSum2dHorizontal: ComputeShader;
    public prefixSum2dVertical: ComputeShader;

    private constructor(prefixSum2dHorizontal: ComputeShader,
                        prefixSum2dVertical: ComputeShader,
                        buffer: PrefixSum2dBuffer)
    {
        this.prefixSum2dHorizontal = prefixSum2dHorizontal;
        this.prefixSum2dVertical = prefixSum2dVertical;
        this.buffer = buffer;
    }

    static async create(engine: GPUEngine,
                        buffer: PrefixSum2dBuffer,
                        settingsBuffer: EngineSettingsBuffer)
    {

        const prefixSum2dHorizontal = await engine.createComputeShader("prefixSum2dHorizontal")
            .addBuffer(() => buffer.buffer, "storage")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .build();

        const prefixSum2dVertical = await engine.createComputeShader("prefixSum2dVertical")
            .addBuffer(() => buffer.buffer, "storage")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .build();

        return new PrefixSum2dComputeShader(prefixSum2dHorizontal, prefixSum2dVertical, buffer);
    }

    public async printGPUData()
    {
        await this.buffer.printGPU();
    }

    public dispatch(measurePerformance: boolean, gridBuffer: GridBuffer, settings: EngineSettings)
    {
        const numberOfCells = settings.gridSizeX * settings.gridSizeY;
        // copy grid to prefixSumBuffer
        this.buffer.buffer.copyFrom(gridBuffer.buffer, numberOfCells * 4);

        this.prefixSum2dVertical.dispatch(measurePerformance, Math.ceil((settings.gridSizeX - 1) / 256));
        this.prefixSum2dHorizontal.dispatch(measurePerformance, Math.ceil((settings.gridSizeY - 1) / 256));
    }
}