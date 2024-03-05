import {ParticleFormation} from "./ParticleFormation";
import {Engine} from "../Engine";
import {Color} from "./Color";

export class Rectangle implements ParticleFormation
{
    indexFrom : number;
    indexTo = 0;
    private _engine: Engine;
    private pointIndexes: number[] = [];
    private width: number;
    private height: number;

    constructor(engine: Engine,
                bottomLeftX: number,
                bottomLeftY: number,
                width: number,
                height: number,
                mass = 1,
                color: Color = {r: 25, g: 255, b: 25} as Color)
    {
        this._engine = engine;
        this.height = height;
        this.width = width;

        for (let y = 0; y < height; y++)
        {
            for (let x = 0; x < width; x++)
            {
                this.pointIndexes.push(this._engine.addPoint(bottomLeftX + x, bottomLeftY + y, mass, color))
            }
        }

        this.indexFrom = this.pointIndexes[0];
        this.indexTo = this.pointIndexes[this.pointIndexes.length - 1];
    }

    rotate(angleInRadians: number): void
    {
    }

    setVelocity(x: number, y: number): void
    {
    }

}