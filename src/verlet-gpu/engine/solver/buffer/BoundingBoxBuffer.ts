import {Vec2d} from "../../data/Vec2d";

export const DEFAULT_BOUNDING_BOX_SETTINGS: BoundingBox = {
    bottomLeft: {x: 0, y: 0},
    topRight: {x: 100, y: 100},
}

export interface BoundingBox
{
    bottomLeft: Vec2d;
    topRight: Vec2d
}

export class BoundingBoxBuffer
{
    public boundingBox: BoundingBox;

    public buffer: GPUBuffer;

    constructor(boundingBox: BoundingBox,
                device : GPUDevice)
    {
        this.boundingBox = boundingBox;

        this.buffer = device.createBuffer({
            label: 'bounding-box buffer',
            size: 4 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
    }


    public writeBuffer(device : GPUDevice)
    {
        //TODO:
    }

}