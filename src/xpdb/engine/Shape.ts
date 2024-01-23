import {PointMass, Points} from "./PointMass";
import {vec2} from "gl-matrix";
import {Engine} from "./Engine";
import {Constraint, Constraints} from "./constraint/Constraint";

export type Shape =
{
    index?: number;
    points: PointMass[];
    isStatic: boolean;
}


export class Shapes
{
    private _engine: Engine;

    constructor(engine: Engine)
    {
        this._engine = engine;
    }
    create(points: PointMass[], constraints: Constraint[], isStatic?: boolean)
    {
        this._engine.addConstraints(...constraints);
        this._engine.addPoints(...points);

        return {points: points, constraints: constraints, isStatic: isStatic} as Shape;
    }

    createRectangle(topLeft: vec2,
                    width: number,
                    height: number,
                    compliance: number,
                    isStatic?: boolean): Shape
    {
        const x = topLeft[0];
        const y = topLeft[1];

        const p1 = Points.create(x + 0, y + 0, 1, isStatic);
        const p2 = Points.create(x + width, y + 0, 1, isStatic);
        const p3 = Points.create(x + width, y + height, 1, isStatic);
        const p4 = Points.create(x + 0, y + height, 1, isStatic);

        const points = [p1, p2, p3, p4];
        const constraints: Constraint[] = [];

        if (isStatic === undefined || !isStatic)
        {
            constraints.push(Constraints.distance(compliance, p1, p2));
            constraints.push(Constraints.distance(compliance, p2, p3));
            constraints.push(Constraints.distance(compliance, p3, p4));
            constraints.push(Constraints.distance(compliance, p4, p1));
            constraints.push(Constraints.distance(compliance, p1, p3));
            constraints.push(Constraints.distance(compliance, p2, p4));
        }

        return this.create(points, constraints, isStatic);
    }

    createComplexRectangle(topLeft: vec2, 
                           width: number, 
                           height: number, 
                           divisions: number,
                           compliance: number)
    {
        const part = width / divisions;
        const x = topLeft[0];
        const y = topLeft[1];
        const constraints: Constraint[] = [];
        const points: PointMass[] = [];

        // top points
        for (let i = 0; i <= divisions; i++)
        {
            const startX = part * i;
            points.push(Points.create(x + startX, y + 0));
        }
        // bottom points
        for (let i = divisions; i >= 0; i--)
        {
            const startX = part * i;
            points.push(Points.create(x + startX, y + height));
        }

        for (let i = 0; i < divisions; i += 1)
        {
            const p1 = points[i + 0];
            const p2 = points[i + 1];
            const p3 = points[1 + divisions * 2 - i - 0];
            const p4 = points[1 + divisions * 2 - i - 1];

            constraints.push(Constraints.distance(compliance, p1, p2));
            constraints.push(Constraints.distance(compliance, p1, p3));
            constraints.push(Constraints.distance(compliance, p1, p4));
            constraints.push(Constraints.distance(compliance, p2, p4));
            constraints.push(Constraints.distance(compliance, p2, p3));
            constraints.push(Constraints.distance(compliance, p4, p3));
        }

        return this.create(points, constraints, false);
    }

}