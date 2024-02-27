import {ParticleFormation} from "./ParticleFormation";
import {Engine} from "../Engine";
import {POINT_DIAMETER} from "../Constants";
import {vec2} from "gl-matrix";
import {Color} from "./Color";

export class Rope implements ParticleFormation
{
    indexFrom: number;
    indexTo: number;
    private _engine: Engine;

    constructor(engine: Engine,
                x1: number,
                y1: number,
                x2: number,
                y2: number,
                compliance: number,
                breakThreshold: number,
                mass: number,
                color: Color = {r: 25, g: 255, b: 25} as Color)
    {
        this._engine = engine;

        const pointIndexes = [];
        const p1 = vec2.fromValues(x1, y1);
        const p2 = vec2.fromValues(x2, y2);

        let step = vec2.sub(vec2.create(), p1, p2);
        step = vec2.normalize(step, step);
        step = vec2.scale(step, step, POINT_DIAMETER);

        const length = Math.floor(vec2.distance(p1, p2));
        for (let i = 0; i < length; i++)
        {
            let point = vec2.fromValues(x1, y1);
            point = vec2.sub(point, point, vec2.scale(vec2.create(), step, i));
            pointIndexes.push(engine.addPoint(point[0], point[1], mass, color));
        }

        for (let i = 0; i < pointIndexes.length - 1; i++)
        {
            engine.addDistanceConstraint(pointIndexes[i], pointIndexes[i + 1], breakThreshold, compliance)
        }

        this.indexFrom = pointIndexes[0];
        this.indexTo = pointIndexes[pointIndexes.length - 1];
    }

    withLastPointStatic = () =>
    {
        this._engine.points.isStatic[this.indexTo] = true;
        return this;
    }

    withFirstPointStatic = () =>
    {
        this._engine.points.isStatic[this.indexFrom] = true;
        return this;
    }

    rotate(angle: number): void
    {
    }

    setVelocity(x: number, y: number): void
    {
    }

}