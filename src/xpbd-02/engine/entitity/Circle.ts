import {ParticleFormation} from "./ParticleFormation";
import {Engine} from "../Engine";
import {Color, Colors} from "./Color";
import {POINT_DIAMETER} from "../Constants";

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

        const createCircle = (radius: number, color: Color): number[] =>
        {
            const pointIndexes: number[] = [];
            const circumference = 2 * Math.PI * radius;
            const numPoints = Math.ceil(circumference / pointDistance);

            // outer points
            for (let i = 0; i < numPoints; i++) {
                const angle = ((i / numPoints) * 2 * Math.PI) + (Math.PI / 2);
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                pointIndexes.push(engine.addPoint(x, y, mass, color));
            }
            return pointIndexes;
        }

        const outerPointIndexes = createCircle(radius, color);
        // constraints around circle
        for (let i = 0; i < outerPointIndexes.length; i++)
        {
            engine.addDistanceConstraint(outerPointIndexes[i], outerPointIndexes[(i + 1) % outerPointIndexes.length], breakThreshold, compliance)
        }

        // inner points
        const innerCircleCount = Math.floor(radius / POINT_DIAMETER);
        for (let i = 0; i < innerCircleCount; i++)
        {
            createCircle(radius - (i + 1) * POINT_DIAMETER, Colors.blue());
        }

        // center point
        engine.addPoint(centerX, centerY, mass, Colors.blue());

        this.indexFrom = outerPointIndexes[0];
        this.indexTo = outerPointIndexes[outerPointIndexes.length - 1];
    }

    rotate(angle: number): void
    {
    }

    setVelocity(x: number, y: number): void
    {
    }

}