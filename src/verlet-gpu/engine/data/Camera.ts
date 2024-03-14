import {Vec2d} from "./Vec2d";

export class Camera
{
    public translation: Vec2d;
    public rotation: number;
    public zoom: number;

    constructor()
    {
        this.translation = {x: 0, y: 0}
        this.rotation = 0;
        this.zoom = 20;
    }
}