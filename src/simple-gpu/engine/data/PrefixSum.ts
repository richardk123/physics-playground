import {Buffer} from "../common/Buffer";
import {GPUEngine} from "../common/GPUEngine";
import {ComputeShader} from "../common/ComputeShader";

const COUNT = 4;

export class PrefixSum
{
    public cellParticleCount: Uint32Array;

    constructor()
    {
        this.cellParticleCount = new Uint32Array(COUNT);
        this.cellParticleCount.fill(1);
    }
}

export class PrefixSumBuffer
{
    public buffer1: Buffer;
    public buffer2: Buffer;
    public prefixSumSettings: Buffer;
    private intData: Uint32Array;
    private data: PrefixSum;

    constructor(engine: GPUEngine)
    {
        this.data = new PrefixSum();

        this.buffer1 = engine.createBuffer("prefix-sum-buffer1", COUNT * 4, "storage");
        this.buffer1.writeBuffer(this.data.cellParticleCount);

        this.buffer2 = engine.createBuffer("prefix-sum-buffer2", COUNT * 4, "storage");
        // copy first
        this.buffer2.writeBuffer(this.data.cellParticleCount, 0, 0, 4);

        this.prefixSumSettings = engine.createBuffer("prefix-sum-settings", 16, "uniform");
        this.intData = new Uint32Array(4);
    }

    public write(step: number)
    {
        this.intData[0] = step;
        this.intData[1] = COUNT;
        this.intData[2] = 0;
        this.intData[3] = 0;

        this.prefixSumSettings.writeBuffer(this.intData);
    }

    public async printGPU(swap: boolean)
    {
        const b1 = new Uint32Array(await this.buffer1.readBuffer());
        const b2 = new Uint32Array(await this.buffer2.readBuffer());
        const s = new Uint32Array(await this.prefixSumSettings.readBuffer());

        if (swap)
        {
            console.log(`buffer2 [${b2.join(", ")}]`);
            console.log(`buffer1 [${b1.join(", ")}]`);
        }
        else
        {
            console.log(`buffer1 [${b1.join(", ")}]`);
            console.log(`buffer2 [${b2.join(", ")}]`);
        }
        console.log(`settings [${s.join(", ")}]`);
    }

    public printExpected()
    {
        const result = [];
        let sum = 0;

        for (let i = 0; i < this.data.cellParticleCount.length; i++) {
            sum += this.data.cellParticleCount[i];
            result.push(sum);
        }

        console.log(`expected [${result.join(", ")}]`);
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

    public async dispatch()
    {
        const rCount = Math.log2(COUNT);
        let swapBuffers = false;

        for (let r = 1; r <= rCount; r++)
        {
            const step = Math.pow(2, r - 1);
            this.buffer.write(step);

            if (swapBuffers)
            {
                this.prefixSum.setBuffers([this.buffer.prefixSumSettings, this.buffer.buffer2, this.buffer.buffer1]);
            }
            else
            {
                this.prefixSum.setBuffers([this.buffer.prefixSumSettings, this.buffer.buffer1, this.buffer.buffer2]);
            }

            this.prefixSum.dispatch(Math.ceil(COUNT / 256));
            await this.buffer.printGPU(swapBuffers);
            swapBuffers = !swapBuffers;
        }

        this.buffer.printExpected();
    }

    static async create(engine: GPUEngine)
    {
        const buffer = new PrefixSumBuffer(engine);
        const prefixSum = await engine.createComputeShader("prefixSum")
            .addBuffer(buffer.prefixSumSettings, "uniform")
            .addBuffer(buffer.buffer1, "read-only-storage")
            .addBuffer(buffer.buffer2, "storage")
            .build();

        return new PrefixSumComputeShader(prefixSum, buffer);
    }

}