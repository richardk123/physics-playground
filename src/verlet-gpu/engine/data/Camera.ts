import {Vec2d} from "./Vec2d";

export class Camera
{
    public translation: Float32Array;
    public rotation: number;
    public scale: Float32Array;

    constructor()
    {
        this.translation = new Float32Array(2);
        this.rotation = 0;
        this.scale = new Float32Array(2);
    }

    public setTranslation(pos: Vec2d)
    {
        this.translation[0] = pos.x;
        this.translation[1] = pos.y;
    }

    public setRotation(angleInRadians: number)
    {
        this.rotation = angleInRadians;
    }

    public setScale(pos: Vec2d)
    {
        this.scale[0] = pos.x;
        this.scale[1] = pos.y;
    }

    public getTranslation(): Vec2d
    {
        return {x: this.translation[0], y: this.translation[1]};
    }

    public getRotation(): number
    {
        return this.rotation;
    }

    public getScale(): Vec2d
    {
        return {x: this.scale[0], y: this.scale[1]};
    }
}