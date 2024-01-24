import p5Types from "p5";
import {Engine} from "../engine/Engine";
import {PointMass} from "../engine/PointMass";
import {DistanceConstraint} from "../engine/constraint/DistanceConstraint";
import {canvasTransform} from "./CanvasUtils";
import {ShapeCollisionConstraint} from "../engine/constraint/ShapeCollisionConstraint";
import {aggregatePointsToConnectedLines} from "../engine/CollisionUtils";

export const renderEngine = (p5: p5Types, canvas: HTMLCanvasElement, engine: Engine) =>
{
    const transform = canvasTransform(canvas);

    const transformCoordinates = (p: PointMass) =>
    {
        return transform.toScreen(p.position[0], p.position[1]);
    }

    engine.points.forEach(p =>
    {
        p5.strokeWeight(1)
        p5.stroke(255, 255, 255);
        p5.fill(255, 255, 255);

        const position = transformCoordinates(p);
        p5.ellipse(position.x, position.y, 10 * p.mass);
    });

    const renderDistanceConstraint = (c : DistanceConstraint) =>
    {
        for (let i = 0; i < c.points.length - 1; i++)
        {
            p5.strokeWeight(1)
            p5.stroke(0, 255, 0);
            p5.fill(0, 255, 0);
            const p1 = transformCoordinates(c.points[i]);
            const p2 = transformCoordinates(c.points[i + 1]);

            p5.line(p1.x, p1.y, p2.x, p2.y);
        }
    }

    const renderStaticShapeCollision = (c: ShapeCollisionConstraint) =>
    {
        p5.strokeWeight(1)
        p5.stroke(255, 0, 0);
        p5.fill(255, 0, 0);

        if (c.shape.isStatic)
        {
            aggregatePointsToConnectedLines(c.shape.points)
                .forEach(l =>
                {
                    const p1 = transform.toScreen(l.start.position[0], l.start.position[1]);
                    const p2 = transform.toScreen(l.end.position[0], l.end.position[1]);
                    p5.line(p1.x, p1.y, p2.x, p2.y);
                })
        }
    }

    engine.constraints.forEach(c =>
    {
        switch (c.type)
        {
            case "distance": renderDistanceConstraint(c as DistanceConstraint); break;
            case "shape-collision": renderStaticShapeCollision(c as ShapeCollisionConstraint); break;
        }
    });
}