import {ParticleFormation} from "./ParticleFormation";
import {Engine} from "../Engine";
import {Color} from "./Color";

export class RandomRectangle implements ParticleFormation
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
                pointsCount: number,
                mass = 1,
                color: Color = {r: 25, g: 255, b: 25} as Color)
    {
        this._engine = engine;
        this.height = height;
        this.width = width;

        for (let i = 0; i < pointsCount; i++)
        {
            const randX = Math.random() * width;
            const randY = Math.random() * height;
            this.pointIndexes.push(this._engine.addPoint(bottomLeftX + randX, bottomLeftY + randY, mass, color));
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