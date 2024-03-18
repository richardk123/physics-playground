export interface GPUData
{
    adapter : GPUAdapter;
    device : GPUDevice;
    context : GPUCanvasContext;
    format : GPUTextureFormat;
    presentationFormat: GPUTextureFormat;
    canvas: HTMLCanvasElement;
    maxBlockSize: number;

}

export async function initGpu(canvas: HTMLCanvasElement): Promise<GPUData>
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

    const maxBlockSize = adapter.limits.maxComputeWorkgroupSizeX;

    console.log(`maxBlockSize: ${maxBlockSize}`);

    return {
        adapter: adapter,
        device: device,
        context: context,
        format: format,
        presentationFormat: presentationFormat,
        canvas: canvas,
        // TODO:?
        maxBlockSize: Math.min(256, maxBlockSize),
    };
}