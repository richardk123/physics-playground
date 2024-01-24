import p5Types from "p5";
import {Engine} from "../engine/Engine";
import {DistanceConstraint} from "../engine/constraint/DistanceConstraint";
import {createTransform, Transform} from "./CanvasUtils";
import {ShapeCollisionConstraint} from "../engine/constraint/ShapeCollisionConstraint";
import {aggregatePointsToConnectedLines} from "../engine/CollisionUtils";
import {vec2} from "gl-matrix";

interface CustomRenderer
{
    render: (p5: p5Types) => void,
    name: string,
}

export interface Renderer
{
    render: (p5: p5Types) => void;
    transform: () => Transform;
    lookAt: (x: number, y: number) => void;
    setSimulatorMinWidth: (width: number) => void;
    addCustomRender: (renderer: CustomRenderer) => void;
    removeCustomRenderer: (name: string) => void;
}

export const createRenderer = (engine: Engine): Renderer =>
{
    let transform = createTransform();
    let lookAtPos = vec2.create();
    let simulatorMinWidth = 60;
    const customRenderers = new Map<string, CustomRenderer>();

    const render = (p5: p5Types) =>
    {
        transform = createTransform(p5.width, p5.height, lookAtPos, simulatorMinWidth);

        engine.points.forEach(p =>
        {
            p5.strokeWeight(1);
            p5.stroke(25, 25, 25);
            p5.fill(25, 25, 25);

            const position = transform.toScreen(p.position[0], p.position[1]);
            p5.ellipse(position.x, position.y, 5 * p.mass);

            // if (!p.isStatic)
            // {
            //     const test = vec2.clone(p.velocity);
            //     vec2.scale(test, test, 2);
            //     vec2.add(test, p.position, test);
            //
            //     const prevPos = transform.toScreen(test[0], test[1]);
            //     p5.strokeWeight(1);
            //     p5.stroke(50, 50, 50);
            //     p5.fill(50, 50, 50);
            //     p5.line(position.x, position.y, prevPos.x, prevPos.y,);
            // }
        });

        const renderDistanceConstraint = (c : DistanceConstraint) =>
        {
            for (let i = 0; i < c.points.length - 1; i++)
            {
                p5.strokeWeight(1)
                p5.stroke(100, 200, 100);
                p5.fill(100, 200, 100);
                const pv1 = c.points[i].position;
                const pv2 = c.points[i + 1].position;
                const p1 = transform.toScreen(pv1[0], pv1[1]);
                const p2 = transform.toScreen(pv2[0], pv2[1]);

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

        customRenderers.forEach((value, key) =>
        {
            value.render(p5);
        })
    }

    return {
        render: render,
        transform: () => transform,
        lookAt: (x: number, y: number) => vec2.set(lookAtPos, x, y),
        setSimulatorMinWidth: (width: number) => simulatorMinWidth = width,
        addCustomRender: (r) => customRenderers.set(r.name, r),
        removeCustomRenderer: (name) => customRenderers.delete(name),
    } as Renderer;
}