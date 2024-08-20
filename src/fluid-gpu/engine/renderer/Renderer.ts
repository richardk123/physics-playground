import {CameraBuffer} from "../data/Camera";

export interface Renderer
{
    render(): void;
    cameraBuffer: CameraBuffer;
    cpuTime: () => number;
    gpuTime: () => number;
    destroy: () => void;
}