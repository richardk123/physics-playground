import {CameraBuffer} from "../data/Camera";

export interface Renderer
{
    render(): void;
    cameraBuffer: CameraBuffer;
    msPerFrame: () => number;
}