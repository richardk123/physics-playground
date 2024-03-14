import {Vec2d} from "./Vec2d";

export class BoundingBox
{
    private data: Float32Array;

    constructor(bottomLeft: Vec2d, topRight: Vec2d)
    {
        this.data = new Float32Array(4);
        this.update(bottomLeft, topRight);
    }

    public update(bottomLeft: Vec2d, topRight: Vec2d): void
    {
        this.data[0] = bottomLeft.x;
        this.data[1] = bottomLeft.y;
        this.data[2] = topRight.x;
        this.data[3] = topRight.y;
    }

    public getData(): Float32Array
    {
        return this.data;
    }

    public getCorners(): {bottomLeft: Vec2d, topRight: Vec2d}
    {
        return {bottomLeft: {x: this.data[0], y: this.data[1]}, topRight: {x: this.data[2], y: this.data[3]}}
    }
}