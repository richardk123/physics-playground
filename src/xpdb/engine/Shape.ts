import {PointMass, Points} from "./PointMass";
import {Constraint, Constraints} from "./constraint/Constraint";
import {mat2, vec2} from "gl-matrix";
import {findGeometricCenter} from "./CollisionUtils2";

export type Shape =
{
    constraints: Constraint[];
    isStatic: boolean;
    points: PointMass[];
    name?: string;
    index?: number,
}

export class Shapes
{
    static rotate = (shape: Shape, angleInRadians: number) =>
    {
        // Create a 2D rotation matrix
        const rotationMatrix = mat2.create();
        mat2.fromRotation(rotationMatrix, angleInRadians);
        const center = findGeometricCenter(shape.points.map(p => p.position));

        return shape.points.map(p => {
            const position = vec2.fromValues(p.position[0], p.position[1]);

            // Translate the point to the origin
            vec2.sub(position, position, center);

            // Multiply the translation vector by the rotation matrix
            vec2.transformMat2(position, position, rotationMatrix);

            // Translate the point back to its original position
            vec2.add(position, position, center);

            // Update the point position
            vec2.set(p.position, position[0], position[1]);

            return p;
        });
    }

    static setVelocity = (shape: Shape, velocity: vec2) =>
    {
        shape.points.forEach(p =>
        {
            vec2.set(p.velocity, velocity[0], velocity[1]);
        })
    }

    static create(points: PointMass[], constraints: Constraint[], isStatic?: boolean, name?: string)
    {
        return {points: points, constraints: constraints, isStatic: isStatic, name: name} as Shape;
    }

    static rectangle(topLeftX: number,
                     topLeftY: number,
                     width: number,
                     height: number,
                     compliance: number,
                     isStatic?: boolean,
                     name?: string): Shape
    {
        const x = topLeftX;
        const y = topLeftY;

        const mass = isStatic === true ? Infinity : 1;

        const p1 = Points.create(x + 0, y + 0, mass, isStatic);
        const p2 = Points.create(x + width, y + 0, mass, isStatic);
        const p3 = Points.create(x + width, y - height, mass, isStatic);
        const p4 = Points.create(x + 0, y - height, mass, isStatic);

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

        return this.create(points, constraints, isStatic, name || "rectangle");
    }

    static complexRectangle(topLeftX: number,
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
            points.push(Points.create(x + startX, y - height));
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

        return this.create(points, constraints, false, "rectangle-complex");
    }

}