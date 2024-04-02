import {Engine} from "../../../engine/Engine";
import p5Types from "p5";
import {Transformer} from "../../../engine/common/Transformer";
import {P5Renderer} from "../../../../components/P5Renderer";
import {Vec2d} from "../../../engine/data/Vec2d";
import {registerMoving, registerScrolling} from "../utils/CanvasUtils";

export const GridDebugRenderer = ({engine}: {engine: Engine}) =>
{
    const render = (p5: p5Types, canvas: HTMLCanvasElement) =>
    {
        const grid = engine.solver.gridBuffer.gpuGrid;
        const settings = engine.solver.settingsBuffer.settings;
        const camera = engine.renderer.cameraBuffer.camera;

        if (!settings.debug)
        {
            return;
        }

        const transform = new Transformer(camera, canvas);

        // draw horizontal lines
        for (let y = 0; y <= settings.gridSizeY; y++)
        {
            const p1 = transform.toClipSpace().position(0, y);
            const p2 = transform.toClipSpace().position(settings.gridSizeX, y);
            p5.line(p1.x, p1.y, p2.x, p2.y);
        }

        // draw vertical lines
        for (let x = 0; x <= settings.gridSizeX; x++)
        {
            const p1 = transform.toClipSpace().position(x, 0);
            const p2 = transform.toClipSpace().position(x, settings.gridSizeY);
            p5.line(p1.x, p1.y, p2.x, p2.y);
        }

        const coordinateFromIndex = (index: number): Vec2d =>
        {
            const y = Math.floor(index / settings.gridSizeX);
            const x = index - (y * settings.gridSizeX);
            return { x, y };
        }

        const numberOfCells = settings.gridSizeX * settings.gridSizeY;

        for (let i = 0; i < numberOfCells; i++)
        {
            const p = transform.toClipSpace().positionVec(coordinateFromIndex(i));
            const particleCount= grid.cellParticleCount[i];

            if (particleCount !== undefined)
            {
                p5.text(particleCount.toFixed(0), p.x, p.y);
            }
        }
    }

    const setup = (p5: p5Types, canvas: HTMLCanvasElement) =>
    {
        const camera = engine.renderer.cameraBuffer.camera;
        registerMoving(canvas, camera);
        registerScrolling(canvas, camera);
    }

    return <P5Renderer render={render} setup={setup} />
}