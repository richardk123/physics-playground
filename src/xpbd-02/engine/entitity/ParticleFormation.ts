import {Engine} from "../Engine";
import {Rectangle} from "./Rectangle";
import {Rope} from "./Rope";
import {Circle} from "./Circle";
import {POINT_DIAMETER} from "../Constants";
import {Color} from "./Color";


export interface ParticleFormation
{
    // index in engine.points
    indexFrom: number;
    // index in engine.points
    indexTo: number;

    rotate: (angle: number) => void;
    setVelocity: (x: number, y: number) => void;
}

export class ParticleFormations
{
    private _engine: Engine;

    constructor(engine: Engine)
    {
        this._engine = engine;
    }

    rectangle(bottomLeftX: number,
              bottomLeftY: number,
              width: number,
              height: number,
              mass: number = 1,
              color: Color = {r: 25, g: 255, b: 25} as Color): Rectangle
    {
        return new Rectangle(this._engine, bottomLeftX, bottomLeftY, width, height, mass, color);
    }

    rope(x1: number,
         y1: number,
         x2: number,
         y2: number,
         compliance: number,
         breakThreshold: number = 0.5,
         mass: number = 1,
         color: Color = {r: 25, g: 255, b: 25} as Color)
    {
        return new Rope(this._engine, x1, y1, x2, y2, compliance, breakThreshold, mass, color);
    }

    circle(centerX: number,
           centerY: number,
           radius: number,
           compliance: number,
           breakThreshold: number,
           mass: number,
           color: Color = {r: 25, g: 255, b: 25} as Color)
    {
        return new Circle(this._engine, centerX, centerY, radius, POINT_DIAMETER, compliance, breakThreshold, mass, color);
    }
}