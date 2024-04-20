import {Camera} from "../data/Camera";
import {Transformer} from "./Transformer";

export class MouseTracker
{
    public x: number = 0;
    public y: number = 0;

    constructor(camera: Camera,
                canvas: HTMLCanvasElement)
    {
        document.onmousemove = e =>
        {
            const transform = new Transformer(camera, canvas);
            const rect = canvas.getBoundingClientRect();

            const pos = transform.toWorldSpace().position(e.x - rect.left, e.y - rect.top);
            this.x =  pos.x;
            this.y = pos.y;
            // console.log(`${this.x} ${this.y}`);
        }
    }

}