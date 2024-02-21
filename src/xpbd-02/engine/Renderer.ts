import {Engine} from "./Engine";
import p5Types from "p5";
import {Transformer} from "./Transformer";
import {POINT_DIAMETER} from "./Constants";
import {Transform} from "../../xpdb/renderer/CanvasUtils";

interface CustomRenderer
{
    render: (p5: p5Types) => void,
    name: string,
}
interface EngineRenderer
{
    render: (p5: p5Types) => void;
    transform: () => Transform;
    lookAt: (x: number, y: number) => void;
    setSimulationWidth: (width: number) => void;
    getSimulationWidth: () => number;
    addCustomRender: (renderer: CustomRenderer) => void;
    removeCustomRenderer: (name: string) => void;
}

export class Renderers
{
    static create  = (engine: Engine) =>
    {
        let transform = Transformer.create();
        let lookAtPos = {x:40, y: 20};
        let simulatorMinWidth = 60;
        const customRenderers = new Map<string, CustomRenderer>();

        const render = (p5: p5Types) =>
        {
            const points = engine.points;
            transform = Transformer.create(p5.width, p5.height, lookAtPos, simulatorMinWidth);

            // for (let i = 0; i < points.count; i++)
            // {
            //     p5.strokeWeight(1);
            //     p5.stroke(25, 25, 25);
            //     p5.fill(25, 255, 25);
            //
            //     const position = transform.toScreen(points.x[i], points.y[i]);
            //     p5.rect(position.x, position.y, transform.toScreenScale(POINT_DIAMETER));
            // }

            for (let i = 0; i < engine.distanceConstraints.count; i++)
            {
                if (engine.distanceConstraints.active[i])
                {
                    p5.strokeWeight(1);
                    p5.stroke(25, 25, 255);

                    const p1Index = engine.distanceConstraints.p1Index[i];
                    const p2Index = engine.distanceConstraints.p2Index[i];

                    const p1 = transform.toScreen(engine.points.x[p1Index], engine.points.y[p1Index]);
                    const p2 = transform.toScreen(engine.points.x[p2Index], engine.points.y[p2Index]);

                    p5.line(p1.x, p1.y, p2.x, p2.y);
                }
            }

            customRenderers.forEach((value, key) =>
            {
                value.render(p5);
            });
        }

        return {
            render: render,
            transform: () => transform,
            lookAt: (x: number, y: number) => lookAtPos = {x: x, y: y},
            setSimulationWidth: (width: number) => simulatorMinWidth = width,
            getSimulationWidth: () => simulatorMinWidth,
            addCustomRender: (r: CustomRenderer) => customRenderers.set(r.name, r),
            removeCustomRenderer: (name: string) => customRenderers.delete(name),
        } as EngineRenderer;
    }
}