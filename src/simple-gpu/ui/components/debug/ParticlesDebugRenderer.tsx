import {Engine} from "../../../engine/Engine";
import {P5Renderer} from "../../../../components/P5Renderer";
import p5Types from "p5";
import {PositionTransformer} from "../../../engine/common/PositionTransformer";

export const ParticlesDebugRenderer = ({engine}: {engine?: Engine}) =>
{
    const render = (p5: p5Types, canvas: HTMLCanvasElement) =>
    {
        if (engine)
        {
            const particles = engine.solver.particlesBuffer.gpuParticles;
            const camera = engine.renderer.cameraBuffer.camera;
            const transform = new PositionTransformer(camera, canvas);

            // render particles
            for (let i = 0; i < particles.count; i++)
            {
                const x = particles.positionCurrent[i * 2 + 0];
                const y = particles.positionCurrent[i * 2 + 1];
                const prevX = particles.positionPrevious[i * 2 + 0];
                const prevY = particles.positionPrevious[i * 2 + 1];
                const velocityX = particles.velocity[i * 2 + 0];
                const velocityY = particles.velocity[i * 2 + 1];

                const tPos = transform.position(x, y);
                const tSize = transform.size(1);
                const precision = 5;
                p5.circle(tPos.x, tPos.y, tSize);
                p5.text(`   cur: [${x.toFixed(precision)}, ${y.toFixed(precision)}], `, tPos.x + tSize / 2, tPos.y - tSize / 2);
                p5.text(` prev: [${prevX.toFixed(precision)}, ${prevY.toFixed(precision)}], `, tPos.x + tSize / 2, tPos.y);
                p5.text(`    vel: [${velocityX.toFixed(precision)}, ${velocityY.toFixed(precision)}], `, tPos.x + tSize / 2, tPos.y + tSize / 2);
            }
        }
    }

    const setup = () =>
    {
    }

    return <P5Renderer render={render} setup={setup} />
}