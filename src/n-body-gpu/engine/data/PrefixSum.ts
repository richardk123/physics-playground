import {GPUEngine} from "../common/GPUEngine";
import {ComputeShader} from "../common/ComputeShader";
import {GridBuffer} from "./Grid";
import {EngineBuffer} from "../common/EngineBuffer";

export class PrefixSumBuffer
{
    public buffer1: EngineBuffer;
    public buffer2: EngineBuffer;
    public prefixSumSettings: EngineBuffer;
    private data: Uint32Array;
    public gpuData: Uint32Array;
    public swap: boolean;

    constructor(engine: GPUEngine)
    {
        this.buffer1 = engine.createBuffer("prefix-sum-buffer1", this.getNumberOfCells() * 4, "storage");
        this.buffer2 = engine.createBuffer("prefix-sum-buffer2", this.getNumberOfCells() * 4, "storage");
        this.prefixSumSettings = engine.createBuffer("prefix-sum-settings", 8, "uniform");
        this.data = new Uint32Array(2);
        this.gpuData = new Uint32Array(this.getNumberOfCells());
        this.swap = false;
    }

    public getNumberOfCells()
    {
        return GridBuffer.GRID_SIZE * GridBuffer.GRID_SIZE;
    }

    public getCurrent(): EngineBuffer
    {
        if (this.swap)
        {
            return this.buffer2;
        }
        else
        {
            return this.buffer1;
        }
    }

    public getSwapped(): EngineBuffer
    {
        if (this.swap)
        {
            return this.buffer1;
        }
        else
        {
            return this.buffer2;
        }
    }


    public write(step: number)
    {
        this.data[0] = step;
        this.data[1] = this.getNumberOfCells();

        this.prefixSumSettings.writeBuffer(this.data);
    }

    public async printGPU()
    {
        // console.log("========================");
        //
        // const previous = new Uint32Array(await this.getSwapped().readBuffer());
        // console.log(`prefixSum swapped [${previous.join(", ")}]`);

        await this.loadGpuData();
        console.log(`prefixSum indexes [${this.gpuData.map((c, i) => i).join(", ")}]`);
        console.log(`prefixSum current [${this.gpuData.join(", ")}]`);
        //
        // const settings = new Uint32Array(await this.prefixSumSettings.readBuffer());
        // console.log(`settings [${settings.join(", ")}]`);
    }

    public async loadGpuData()
    {
        this.gpuData = new Uint32Array(await this.getCurrent().readBuffer());
    }

    public destroy()
    {
        this.buffer1.destroy();
        this.buffer2.destroy();
        this.prefixSumSettings.destroy();
    }
}

export class PrefixSumComputeShader
{
    public buffer: PrefixSumBuffer;
    public prefixSum: ComputeShader;

    private constructor(prefixSum: ComputeShader,
                        buffer: PrefixSumBuffer)
    {
        this.prefixSum = prefixSum;
        this.buffer = buffer;
    }

    public dispatch(gridBuffer: GridBuffer)
    {
        const numberOfCells = this.buffer.getNumberOfCells();
        // copy cell particle count to buffer1
        this.buffer.buffer1.copyFrom(gridBuffer.buffer, numberOfCells * 4);
        // copy first value
        this.buffer.buffer2.copyFrom(this.buffer.buffer1, 4);

        const treeHeight = Math.log2(numberOfCells);
        this.buffer.swap = false;

        for (let d = 1; d <= treeHeight; d++)
        {
            const step = Math.pow(2, d - 1);
            this.buffer.write(step);

            this.prefixSum.dispatch(false, Math.ceil(numberOfCells / 256));
            this.buffer.swap = !this.buffer.swap;
        }
    }

    public gpuTime(): number
    {
        const numberOfCells = this.buffer.getNumberOfCells();
        const treeHeight = Math.log2(numberOfCells);
        return this.prefixSum.gpuTime() * treeHeight;
    }

    public async printGPUData()
    {
        await this.buffer.printGPU();
    }

    static async create(engine: GPUEngine,
                        buffer: PrefixSumBuffer)
    {

        const prefixSum = await engine.createComputeShader("prefixSum")
            .addBuffer(() => buffer.prefixSumSettings, "uniform")
            .addBuffer(() => buffer.getCurrent(), "read-only-storage")
            .addBuffer(() => buffer.getSwapped(), "storage")
            .build();

        return new PrefixSumComputeShader(prefixSum, buffer);
    }

    public destroy()
    {
        this.buffer.destroy();
    }
}