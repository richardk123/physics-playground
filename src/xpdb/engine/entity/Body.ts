import {PointMass, Points} from "./PointMass";
import {Constraint, Constraints} from "../constraint/Constraint";
import {mat2, vec2} from "gl-matrix";
import {findGeometricCenter} from "../utils/CollisionUtils2";
import {Polygon} from "./Polygon";

export type Body =
{
    constraints: Constraint[];
    points: PointMass[];
    name?: string;
    index?: number,
}

export class Bodies
{
    static rotate = (body: Body, angleInRadians: number) =>
    {
        // Create a 2D rotation matrix
        Polygon.rotate(body.points.map(p => p.position), angleInRadians);
    }

    static setVelocity = (shape: Body, velocity: vec2) =>
    {
        shape.points.forEach(p =>
        {
            vec2.set(p.velocity, velocity[0], velocity[1]);
        })
    }

    static create(points: PointMass[], constraints: Constraint[], name?: string)
    {
        return {points: points, constraints: constraints, name: name} as Body;
    }

    static rope(topX: number,
                topY: number,
                length: number,
                compliance: number,
                mass = 1,
                name?: string): Body
    {
        const firstPoint = Points.create(topX, topY, Infinity, true);

        const points: PointMass[] = [firstPoint];

        for (let i = 1; i < length; i++)
        {
            points.push(Points.create(topX, topY - i, mass));
        }

        return this.create(points, [Constraints.distance(compliance, ...points)], name || "rectangle");
    }

    static rectangle(topLeftX: number,
                     topLeftY: number,
                     width: number,
                     height: number,
                     compliance: number,
                     mass = 1,
                     name?: string): Body
    {
        const points: PointMass[] = [];

        for (let y = 0; y < height; y++)
        {
            for (let x = 0; x < width; x++)
            {
                points.push(Points.create(topLeftX + x, topLeftY + y, mass))
            }
        }

        const constraints: Constraint[] = [];
        const threshold = 0.5;

        // Create constraints for neighboring points
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const currentIndex = y * width + x;

                // Right neighbor
                if (x < width - 1) {
                    const rightIndex = y * width + (x + 1);
                    constraints.push(
                        Constraints.distance2(
                            compliance,
                            threshold,
                            points[currentIndex],
                            points[rightIndex]
                        )
                    );
                }

                // Bottom neighbor
                if (y < height - 1) {
                    const bottomIndex = (y + 1) * width + x;
                    constraints.push(
                        Constraints.distance2(
                            compliance,
                            threshold,
                            points[currentIndex],
                            points[bottomIndex]
                        )
                    );
                }

                // Diagonal neighbor
                if (x < width - 1 && y < height - 1) {
                    const diagonalIndex = (y + 1) * width + (x + 1);
                    constraints.push(
                        Constraints.distance2(
                            compliance,
                            threshold,
                            points[currentIndex],
                            points[diagonalIndex]
                        )
                    );
                }

                // Diagonal neighbor
                if (x < width - 1 && y < height - 1) {
                    const bottomIndex = (y + 1) * width + x;
                    const rightIndex = y * width + (x + 1);
                    constraints.push(
                        Constraints.distance2(
                            compliance,
                            threshold,
                            points[rightIndex],
                            points[bottomIndex]
                        )
                    );
                }
            }
        }

        return this.create(points, constraints, name || "rectangle");
    }


}