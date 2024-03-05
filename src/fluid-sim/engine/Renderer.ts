import {Engine} from "./Engine";
import p5Types from "p5";
import {Transformer} from "./Transformer";
import {POINT_DIAMETER} from "./Constants";
import {Transform} from "../../xpdb/renderer/CanvasUtils";
import {Points} from "../../xpdb/engine/entity/PointMass";
import {PointsData} from "./Points";
import {WORLD_MAX_X, WORLD_MAX_Y, WORLD_MIN_X, WORLD_MIN_Y} from "./constraint/FloorConstraint";

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

        const renderPoints = (p5: p5Types) =>
        {
            const points = engine.points;
            for (let i = 0; i < points.count; i++)
            {
                const isStatic = points.isStatic[i];
                if (!isStatic)
                {

                    p5.strokeWeight(1);
                    const densityColor = (128 / engine.info().averageDensity) * points.density[i];
                    p5.stroke(densityColor, 0, 0);
                    p5.fill(densityColor, 0, 0);

                    const position = transform.toScreen(points.positionCurrent[i * 2], points.positionCurrent[i * 2 + 1]);
                    p5.rect(position.x, position.y, transform.toScreenScale(POINT_DIAMETER));
                }
            }
        }

        const renderFloorConstraint = (p5: p5Types) =>
        {
            const topLeft = transform.toScreen(WORLD_MIN_X, WORLD_MAX_Y);
            const topRight = transform.toScreen(WORLD_MAX_X, WORLD_MAX_Y);
            const bottomLeft =  transform.toScreen(WORLD_MIN_X, WORLD_MIN_Y);
            const bottomRight =  transform.toScreen(WORLD_MAX_X, WORLD_MIN_Y);

            p5.strokeWeight(1);
            p5.stroke(255, 25, 25);

            p5.line(topLeft.x, topLeft.y, topRight.x, topRight.y);
            p5.line(bottomLeft.x, bottomLeft.y, bottomRight.x, bottomRight.y);
            p5.line(topLeft.x, topLeft.y, bottomLeft.x, bottomLeft.y);
            p5.line(topRight.x, topRight.y, bottomRight.x, bottomRight.y);
        }

        const render = (p5: p5Types) =>
        {
            transform = Transformer.create(p5.width, p5.height, lookAtPos, simulatorMinWidth);

            renderFloorConstraint(p5);
            renderPoints(p5);
            // renderDistanceConstraints(p5);

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