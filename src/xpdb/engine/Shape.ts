import {PointMass, Points} from "./PointMass";
import {Constraint, Constraints} from "./constraint/Constraint";
import {mat2, vec2} from "gl-matrix";

export type Shape =
{
    center: vec2;
    constraints: Constraint[];
    isStatic: boolean;
    points: PointMass[];
    name?: string;
}
 const findGeometricCenter = (points: PointMass[]): vec2 =>
{
    if (!points.length) {
        throw new Error("no points found");
    }

    const avgX = points.reduce((sum, point) => sum + point.position[0], 0) / points.length;
    const avgY = points.reduce((sum, point) => sum + point.position[1], 0) / points.length;

    return vec2.fromValues(avgX, avgY);
}

export class Shapes
{
    static rotate = (shape: Shape, angleInDegrees: number) =>
    {
        const angleInRadians = (angleInDegrees * Math.PI) / 180;

        // Create a 2D rotation matrix
        const rotationMatrix = mat2.create();
        mat2.fromRotation(rotationMatrix, angleInRadians);

        return shape.points.map(p =>
        {
            const x = p.position[0];
            const y = p.position[1];

            const translatedPoint = vec2.fromValues(x - shape.center[0], y - shape.center[1]);
            const rotatedPoint = vec2.create();

            // Multiply the translation vector by the rotation matrix
            vec2.transformMat2(rotatedPoint, translatedPoint, rotationMatrix);

            // Translate the point back to its original position
            const finalX = rotatedPoint[0] + shape.center[0];
            const finalY = rotatedPoint[1] + shape.center[1];

            return vec2.set(p.position, finalX, finalY);
        });
    }

    static create(points: PointMass[], constraints: Constraint[], isStatic?: boolean, name?: string)
    {
        const center = findGeometricCenter(points);
        return {points: points, constraints: constraints, center: center, isStatic: isStatic, name: name} as Shape;
    }

    static createRectangle(topLeftX: number,
                           topLeftY: number,
                           width: number,
                           height: number,
                           compliance: number,
                           isStatic?: boolean,
                           name?: string): Shape
    {
        const x = topLeftX;
        const y = topLeftY;

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

        return this.create(points, constraints, isStatic, name);
    }

    static createComplexRectangle(topLeftX: number,
                                  topLeftY: number,
                                  width: number,
                                  height: number,
                                  divisions: number,
                                  compliance: number)
    {
        const part = width / divisions;
        const x = topLeftX;
        const y = topLeftY;
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