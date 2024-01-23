import p5Types from "p5";
import {Engine} from "../engine/Engine";
import {PointMass} from "../engine/PointMass";
import {DistanceConstraint} from "../engine/solver/DistanceConstraint";

export const renderEngine = (p5: p5Types, engine: Engine) =>
{
    const simMinWidth = 20;
    const cScale = Math.min(p5.width, p5.height) / simMinWidth;
    const simWidth = p5.width / cScale;
    const simHeight = p5.height / cScale;

    const transformCoordinates = (p: PointMass) =>
    {
        const x = p.position[0] * cScale;
        const y = p5.height - p.position[1] * cScale;
        return {x: x, y: y};
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

    engine.constraints.forEach(c =>
    {
        switch (c.type)
        {
            case "distance": renderDistanceConstraint(c as DistanceConstraint); break;
        }
    });
}