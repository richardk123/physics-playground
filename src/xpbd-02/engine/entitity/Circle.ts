import {ParticleFormation} from "./ParticleFormation";
import {Engine} from "../Engine";
import {Color} from "./Color";

export class Circle implements ParticleFormation
{
    indexFrom: number;
    indexTo: number;
    private _engine: Engine;

    constructor(engine: Engine,
                centerX: number,
                centerY: number,
                radius: number,
                pointDistance: number,
                compliance: number,
                breakThreshold: number,
                mass: number,
                color: Color = {r: 25, g: 255, b: 25} as Color)
    {
        this._engine = engine;

        const pointIndexes: number[] = [];
        const circumference = 2 * Math.PI * radius;
        const numPoints = Math.ceil(circumference / pointDistance);

        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            pointIndexes.push(engine.addPoint(x, y, mass, color));
        }

        // constraints around circle
        for (let i = 0; i < pointIndexes.length; i++)
        {
            engine.addDistanceConstraint(pointIndexes[i], pointIndexes[(i + 1) % pointIndexes.length], breakThreshold, compliance)
        }

        this.indexFrom = pointIndexes[0];
        this.indexTo = pointIndexes[pointIndexes.length - 1];
    }

    rotate(angle: number): void
    {
    }

    setVelocity(x: number, y: number): void
    {
    }

}