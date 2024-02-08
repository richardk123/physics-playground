import {vec2} from "gl-matrix";

export class Polygon
{
    static rectangle(topLeftX: number,
                     topLeftY: number,
                     width: number,
                     height: number): vec2[]
    {
        const x = topLeftX;
        const y = topLeftY;

        const p1 = vec2.fromValues(x, y);
        const p2 = vec2.fromValues(x + width, y);
        const p3 = vec2.fromValues(x + width, y - height);
        const p4 = vec2.fromValues(x, y - height);

        return [p1, p2, p3, p4];
    }
}