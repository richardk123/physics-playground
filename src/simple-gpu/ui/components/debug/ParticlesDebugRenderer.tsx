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
            const settings = engine.solver.settingsBuffer.settings;
            const camera = engine.renderer.cameraBuffer.camera;
            const transform = new Transformer(camera, canvas);

            if (!settings.debug)
            {
                return;
            }

            // bounding box
            const gridTopRight = transform.toClipSpace().position(settings.gridSizeX, settings.gridSizeY);
            const gridBottomLeft = transform.toClipSpace().position(0, 0);

            p5.line(gridBottomLeft.x, gridBottomLeft.y, gridTopRight.x, gridBottomLeft.y);
            p5.line(gridBottomLeft.x, gridBottomLeft.y, gridBottomLeft.x, gridTopRight.y);
            p5.line(gridBottomLeft.x, gridTopRight.y, gridTopRight.x, gridTopRight.y);
            p5.line(gridTopRight.x, gridTopRight.y, gridTopRight.x, gridBottomLeft.y);

            // render particles
            for (let i = 0; i < particles.count; i++)
            {
                const x = particles.positionCurrent[i * 2 + 0];
                const y = particles.positionCurrent[i * 2 + 1];
                const prevX = particles.positionPrevious[i * 2 + 0];
                const prevY = particles.positionPrevious[i * 2 + 1];
                const velocityX = particles.velocity[i * 2 + 0];
                const velocityY = particles.velocity[i * 2 + 1];

                const tPos = transform.toClipSpace().position(x, y);
                const tSize = transform.toClipSpace().size(1);
                const precision = 2;
                p5.fill(0, 0);
                p5.circle(tPos.x, tPos.y, tSize);

                p5.fill(0, 255);
                p5.text(`   cur: [${x.toFixed(precision)}, ${y.toFixed(precision)}], `, tPos.x + tSize / 2, tPos.y - tSize / 2);
                p5.text(` prev: [${prevX.toFixed(precision)}, ${prevY.toFixed(precision)}], `, tPos.x + tSize / 2, tPos.y);
                p5.text(`    vel: [${velocityX.toFixed(precision)}, ${velocityY.toFixed(precision)}], `, tPos.x + tSize / 2, tPos.y + tSize / 2);
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