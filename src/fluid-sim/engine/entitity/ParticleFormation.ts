import {Engine} from "../Engine";
import {RandomRectangle} from "./RandomRectangle";
import {Color} from "./Color";
import {Rectangle} from "./Rectangle";
import {CollisionCircle} from "./CollisionCircle";


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

    randomRectangle(bottomLeftX: number,
              bottomLeftY: number,
              width: number,
              height: number,
              pointsCount: number,
              mass: number = 1,
              color: Color = {r: 25, g: 255, b: 25} as Color): RandomRectangle
    {
        return new RandomRectangle(this._engine, bottomLeftX, bottomLeftY, width, height, pointsCount, mass, color);
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

    collisionCircle(x: number,
                    y: number,
                    radius: number): CollisionCircle
    {
        return new CollisionCircle(this._engine, x, y, radius);
    }
}