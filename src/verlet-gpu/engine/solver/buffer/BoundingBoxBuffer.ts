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
    readonly data: Float32Array;

    constructor(boundingBox: BoundingBox,
                device : GPUDevice)
    {
        this.boundingBox = boundingBox;
        this.data = new Float32Array(4);

        this.buffer = device.createBuffer({
            label: 'bounding-box buffer',
            size: 4 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
    }


    public writeBuffer(device : GPUDevice)
    {
        this.data[0] = this.boundingBox.bottomLeft.x;
        this.data[1] = this.boundingBox.bottomLeft.y;
        this.data[2] = this.boundingBox.topRight.x;
        this.data[3] = this.boundingBox.topRight.y;

        device.queue.writeBuffer(this.buffer, 0, this.data);
    }

}