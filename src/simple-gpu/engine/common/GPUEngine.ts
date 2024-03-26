import {BufferBinding, ComputeShaderBuilder} from "./ComputeShader";
import {EngineSettings} from "../data/EngineSettings";
import {Buffer, BufferType} from "./Buffer";

export class GPUEngine
{
    public readonly adapter : GPUAdapter;
    public readonly device : GPUDevice;
    public readonly context : GPUCanvasContext;
    public readonly format : GPUTextureFormat;
    public readonly presentationFormat: GPUTextureFormat;
    public readonly canvas: HTMLCanvasElement;

    private constructor(adapter : GPUAdapter,
                        device : GPUDevice,
                        context : GPUCanvasContext,
                        format : GPUTextureFormat,
                        presentationFormat: GPUTextureFormat,
                        canvas: HTMLCanvasElement)
    {
        this.adapter = adapter;
        this.device = device;
        this.context = context;
        this.format = format;
        this.presentationFormat = presentationFormat;
        this.canvas = canvas;
    }

    static async create(canvas: HTMLCanvasElement)
    {
        const adapter : GPUAdapter = <GPUAdapter> await navigator.gpu?.requestAdapter();
        const device : GPUDevice = <GPUDevice> await adapter?.requestDevice();
        const context : GPUCanvasContext = <GPUCanvasContext> canvas.getContext("webgpu");
        const format : GPUTextureFormat = navigator.gpu.getPreferredCanvasFormat();
        const presentationFormat: GPUTextureFormat = navigator.gpu.getPreferredCanvasFormat();

        context.configure({
            device,
            format: presentationFormat,
        });

        return new GPUEngine(adapter, device, context, format, presentationFormat, canvas);
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

}