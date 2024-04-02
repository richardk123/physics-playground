import {Buffer} from "../common/Buffer";
import {GPUEngine} from "../common/GPUEngine";
import {ComputeShader} from "../common/ComputeShader";
import {EngineSettings} from "./EngineSettings";
import {GridBuffer} from "./Grid";

export class PrefixSumBuffer
{
    public buffer1: Buffer;
    public buffer2: Buffer;
    public prefixSumSettings: Buffer;
    private data: Uint32Array;
    private settings: EngineSettings;

    constructor(engine: GPUEngine,
                settings: EngineSettings)
    {
        this.settings = settings;
        this.buffer1 = engine.createBuffer("prefix-sum-buffer1", this.getNumberOfCells() * 4, "storage");
        this.buffer2 = engine.createBuffer("prefix-sum-buffer2", this.getNumberOfCells() * 4, "storage");
        this.prefixSumSettings = engine.createBuffer("prefix-sum-settings", 16, "uniform");
        this.data = new Uint32Array(4);
    }

    public getNumberOfCells()
    {
        return this.settings.gridSizeX * this.settings.gridSizeY;
    }

    public write(step: number)
    {
        this.data[0] = step;
        this.data[1] = this.getNumberOfCells();
        this.data[2] = 0;
        this.data[3] = 0;

        this.prefixSumSettings.writeBuffer(this.data);
    }

    public async printGPU(swap: boolean)
    {
        const b1 = new Uint32Array(await this.buffer1.readBuffer());
        const b2 = new Uint32Array(await this.buffer2.readBuffer());

        if (swap)
        {
            console.log(`buffer2 [${b2.join(", ")}]`);
        }
        else
        {
            console.log(`buffer1 [${b1.join(", ")}]`);
        }
    }

    public printExpected(data: Uint32Array)
    {
        const result = [];
        let sum = 0;

        for (let i = 0; i < data.length; i++) {
            sum += data[i];
            result.push(sum);
        }

        console.log(`expected [${result.join(", ")}]`);
    }
}

export class PrefixSumComputeShader
{
    public buffer: PrefixSumBuffer;
    public prefixSum: ComputeShader;
    private swapBuffers: boolean;

    private constructor(prefixSum: ComputeShader,
                        buffer: PrefixSumBuffer)
    {
        this.prefixSum = prefixSum;
        this.buffer = buffer;
        this.swapBuffers = false;
    }

    public async dispatch(gridBuffer: GridBuffer)
    {
        const numberOfCells = this.buffer.getNumberOfCells();
        // copy cell particle count to buffer1
        this.buffer.buffer1.copyFrom(gridBuffer.cellParticleCountBuffer, numberOfCells * 4);
        // copy first value
        this.buffer.buffer2.copyFrom(this.buffer.buffer1, 4);

        const rCount = Math.log2(numberOfCells);
        this.swapBuffers = false;

        for (let r = 1; r <= rCount; r++)
        {
            const step = Math.pow(2, r - 1);
            this.buffer.write(step);

            if (this.swapBuffers)
            {
                this.prefixSum.setBuffers([this.buffer.prefixSumSettings, this.buffer.buffer2, this.buffer.buffer1]);
            }
            else
            {
                this.prefixSum.setBuffers([this.buffer.prefixSumSettings, this.buffer.buffer1, this.buffer.buffer2]);
            }

            this.prefixSum.dispatch(Math.ceil(numberOfCells / 256));

            this.swapBuffers = !this.swapBuffers;
        }

        await this.buffer.printGPU(this.swapBuffers);

        // print expected
        await gridBuffer.loadFromGpu();
        this.buffer.printExpected(gridBuffer.gpuGrid.cellParticleCount);
    }

    public getPrefixSumBuffer(): Buffer
    {
        if (this.swapBuffers)
        {
            return this.buffer.buffer2;
        }
        else
        {
            return this.buffer.buffer1;
        }
    }

    static async create(engine: GPUEngine,
                        buffer: PrefixSumBuffer)
    {

        const prefixSum = await engine.createComputeShader("prefixSum")
            .addBuffer(buffer.prefixSumSettings, "uniform")
            .addBuffer(buffer.buffer1, "read-only-storage")
            .addBuffer(buffer.buffer2, "storage")
            .build();

        return new PrefixSumComputeShader(prefixSum, buffer);
    }

}