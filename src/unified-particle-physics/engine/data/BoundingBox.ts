import {Vec2d} from "./Vec2d";

export interface BoundingBox
{
    bottomLeft: Vec2d;
    topRight: Vec2d;
}

export class BoundingBoxes
{
    static create(x: number, y: number, width: number, height: number): BoundingBox
    {
        return {bottomLeft: {x: x, y: y}, topRight: {x: x + width, y: y + height}}
    }

    static createFromVec(bottomLeft: Vec2d, topRight: Vec2d): BoundingBox
    {
        return {bottomLeft: bottomLeft, topRight: topRight}
    }

}