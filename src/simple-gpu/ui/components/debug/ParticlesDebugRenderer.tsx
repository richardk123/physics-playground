import {Engine} from "../../../engine/Engine";
import {P5Renderer} from "../../../../components/P5Renderer";
import p5Types from "p5";
import {Transformer} from "../../../engine/common/Transformer";
import {registerMoving, registerScrolling} from "../utils/CanvasUtils";

export const ParticlesDebugRenderer = ({engine}: {engine: Engine}) =>
{
    const render = (p5: p5Types, canvas: HTMLCanvasElement) =>
    {
        if (engine)
        {
            const particles = engine.solver.particlesBuffer.gpuParticles;
            const particleData = new Float32Array(particles.data);
            const settings = engine.solver.settingsBuffer.settings;
            const camera = engine.renderer.cameraBuffer.camera;
            const transform = new Transformer(camera, canvas);

            if (!settings.debug)
            {
                return;
            }

            // bounding box
            const gridTopRight = transform.toClipSpace().position(settings.gridSizeX * settings.cellSize, settings.gridSizeY * settings.cellSize);
            const gridBottomLeft = transform.toClipSpace().position(0, 0);

            p5.line(gridBottomLeft.x, gridBottomLeft.y, gridTopRight.x, gridBottomLeft.y);
            p5.line(gridBottomLeft.x, gridBottomLeft.y, gridBottomLeft.x, gridTopRight.y);
            p5.line(gridBottomLeft.x, gridTopRight.y, gridTopRight.x, gridTopRight.y);
            p5.line(gridTopRight.x, gridTopRight.y, gridTopRight.x, gridBottomLeft.y);

            // render particles
            for (let i = 0; i < particles.count; i++)
            {
                const x = particleData[i * 8 + 0];
                const y = particleData[i * 8 + 1];

                const tPos = transform.toClipSpace().position(x, y);
                const tSize = transform.toClipSpace().size(1);
                const precision = 2;
                p5.fill(0, 0);
                p5.circle(tPos.x, tPos.y, tSize);

                p5.fill(0, 255);
                p5.text(`${i} - [${x.toFixed(2)}, ${y.toFixed(2)}], `, tPos.x - tSize / 4, tPos.y);
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