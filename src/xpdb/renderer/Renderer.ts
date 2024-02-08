import p5Types from "p5";
import {Engine} from "../engine/Engine";
import {DistanceConstraint} from "../engine/constraint/DistanceConstraint";
import {createTransform, Transform} from "./CanvasUtils";
import {vec2} from "gl-matrix";
import {PolygonCollisionConstraint} from "../engine/constraint/PolygonCollisionConstraint";
import {findPolygonLines} from "../engine/utils/CollisionUtils2";
import {POINT_DIAMETER} from "../engine/PhysicsConstants";
import {BodyConstraint} from "../engine/constraint/BodyConstraint";

interface CustomRenderer
{
    render: (p5: p5Types) => void,
    name: string,
}

export interface EngineRenderer
{
    render: (p5: p5Types) => void;
    transform: () => Transform;
    lookAt: (x: number, y: number) => void;
    setSimulationWidth: (width: number) => void;
    getSimulationWidth: () => number;
    addCustomRender: (renderer: CustomRenderer) => void;
    removeCustomRenderer: (name: string) => void;
}

export const createRenderer = (engine: Engine): EngineRenderer =>
{
    let transform = createTransform();
    let lookAtPos = vec2.fromValues(40, 20);
    let simulatorMinWidth = 60;
    const customRenderers = new Map<string, CustomRenderer>();

    const render = (p5: p5Types) =>
    {
        transform = createTransform(p5.width, p5.height, lookAtPos, simulatorMinWidth);

        engine.points.forEach(p =>
        {
            p5.strokeWeight(1);
            p5.stroke(25, 25, 25);
            p5.fill(255);

            const position = transform.toScreen(p.position[0], p.position[1]);
            p5.ellipse(position.x, position.y, transform.toScreenScale(POINT_DIAMETER));

            const prevPos = transform.toScreen(p.previousPosition[0], p.previousPosition[1]);
            p5.strokeWeight(1);
            p5.stroke(50, 50, 50);
            p5.fill(50, 50, 50);
            p5.line(position.x, position.y, prevPos.x, prevPos.y);
        });

        const renderDistanceConstraint = (c : DistanceConstraint) =>
        {
            for (let i = 0; i < c.points.length - 1; i++)
            {
                p5.strokeWeight(1)
                p5.stroke(100, 200, 100);
                const pv1 = c.points[i].position;
                const pv2 = c.points[i + 1].position;
                const p1 = transform.toScreen(pv1[0], pv1[1]);
                const p2 = transform.toScreen(pv2[0], pv2[1]);

                p5.line(p1.x, p1.y, p2.x, p2.y);
            }
        }

        const renderPolygonConstraint = (c: PolygonCollisionConstraint) =>
        {
            const lines = findPolygonLines(c.polygon);
            p5.strokeWeight(1);
            p5.stroke(255, 0, 0);

            lines
                .forEach(l =>
                {
                    const p1 = transform.toScreen(l.start[0], l.start[1]);
                    const p2 = transform.toScreen(l.end[0], l.end[1]);
                    p5.line(p1.x, p1.y, p2.x, p2.y);
                });
        }


        engine.constraints.forEach(c =>
        {
            switch (c.type)
            {
                case "distance": renderDistanceConstraint(c as DistanceConstraint); break;
                case "polygon-collision": renderPolygonConstraint(c as PolygonCollisionConstraint); break;
                case "body-constraint": (c as BodyConstraint).distanceConstraints.forEach(c => renderDistanceConstraint(c)); break;
            }
        });

        customRenderers.forEach((value, key) =>
        {
            value.render(p5);
        });
    }

    return {
        render: render,
        transform: () => transform,
        lookAt: (x: number, y: number) => vec2.set(lookAtPos, x, y),
        setSimulationWidth: (width: number) => simulatorMinWidth = width,
        getSimulationWidth: () => simulatorMinWidth,
        addCustomRender: (r) => customRenderers.set(r.name, r),
        removeCustomRenderer: (name) => customRenderers.delete(name),
    } as EngineRenderer;
}