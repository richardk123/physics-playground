export interface GPUData
{
    adapter : GPUAdapter;
    device : GPUDevice;
    context : GPUCanvasContext;
    format : GPUTextureFormat;
    presentationFormat: GPUTextureFormat;
    canvas: HTMLCanvasElement;

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

    return {
        adapter: adapter,
        device: device,
        context: context,
        format: format,
        presentationFormat: presentationFormat,
        canvas: canvas
    };
}