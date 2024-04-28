import {ComputeShaderBuilder} from "./ComputeShader";
import {Buffer, BufferType} from "./Buffer";

interface GPUMeasurementData
{
    querySet: GPUQuerySet,
    resolveBuffer: GPUBuffer,
    resultBuffer: GPUBuffer,
}

export class GPUMeasurement
{
    private data: GPUMeasurementData;
    private engine: GPUEngine;
    public gpuTime = 0;

    constructor(engine: GPUEngine)
    {
        this.engine = engine;
        const device = engine.device;

        if (!engine.canTimestamp) {
            this.data = {} as GPUMeasurementData;
        }
        else
        {
            const querySet = device.createQuerySet({
                type: 'timestamp',
                count: 2,
            });
            const resolveBuffer = device.createBuffer({
                size: querySet.count * 8,
                usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC,
            });
            const resultBuffer = device.createBuffer({
                size: resolveBuffer.size,
                usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
            });

            this.data = {querySet, resolveBuffer, resultBuffer };
        }
    }
    public writesDescriptor()
    {
        return (this.engine.canTimestamp && {timestampWrites: {
                querySet: this.data.querySet,
                beginningOfPassWriteIndex: 0,
                endOfPassWriteIndex: 1,
            }});
    }

    public copy(encoder: GPUCommandEncoder) {
        if (this.engine.canTimestamp) {
            encoder.resolveQuerySet(this.data.querySet, 0, 2, this.data.resolveBuffer, 0);
            if (this.data.resultBuffer.mapState === 'unmapped') {
                encoder.copyBufferToBuffer(this.data.resolveBuffer, 0, this.data.resultBuffer, 0, this.data.resultBuffer.size);
            }
        }
    }

    public read(encoder: GPUCommandEncoder)
    {
        if (this.engine.canTimestamp && this.data.resultBuffer.mapState === 'unmapped') {
            this.data.resultBuffer.mapAsync(GPUMapMode.READ)
                .then(() => {
                    const times = new BigInt64Array(this.data.resultBuffer.getMappedRange());
                    this.gpuTime = Number(times[1] - times[0]);
                    this.data.resultBuffer.unmap();
                })
                .catch(e =>
                {

                });
        }
    }
}

export class GPUEngine
{
    public readonly adapter : GPUAdapter;
    public readonly device : GPUDevice;
    public readonly context : GPUCanvasContext;
    public readonly format : GPUTextureFormat;
    public readonly presentationFormat: GPUTextureFormat;
    public readonly canvas: HTMLCanvasElement;
    public readonly canTimestamp: boolean;

    private constructor(adapter : GPUAdapter,
                        device : GPUDevice,
                        context : GPUCanvasContext,
                        format : GPUTextureFormat,
                        presentationFormat: GPUTextureFormat,
                        canvas: HTMLCanvasElement,
                        canTimestamp: boolean)
    {
        this.adapter = adapter;
        this.device = device;
        this.context = context;
        this.format = format;
        this.presentationFormat = presentationFormat;
        this.canvas = canvas;
        this.canTimestamp = canTimestamp;
    }

    static async create(canvas: HTMLCanvasElement)
    {
        const adapter : GPUAdapter = <GPUAdapter> await navigator.gpu?.requestAdapter();
        const canTimestamp = adapter.features.has('timestamp-query');
        const device : GPUDevice = <GPUDevice> await adapter?.requestDevice({
            requiredFeatures: [
                ...(canTimestamp ? ['timestamp-query'] : []),
            ] as GPUFeatureName[],
        });
        const context : GPUCanvasContext = <GPUCanvasContext> canvas.getContext("webgpu");
        const format : GPUTextureFormat = navigator.gpu.getPreferredCanvasFormat();
        const presentationFormat: GPUTextureFormat = navigator.gpu.getPreferredCanvasFormat();

        context.configure({
            device,
            format: presentationFormat,
        });

        return new GPUEngine(adapter, device, context, format, presentationFormat, canvas, canTimestamp);
    }

    public createComputeShader(name: string): ComputeShaderBuilder
    {
        return new ComputeShaderBuilder(this, name);
    }

    public createBuffer(name: string,
                        size: GPUSize64,
                        type: BufferType): Buffer
    {
        return new Buffer(this, name, size, type);
    }

    public createGPUMeasurement(): GPUMeasurement
    {
        return new GPUMeasurement(this);
    }
}
