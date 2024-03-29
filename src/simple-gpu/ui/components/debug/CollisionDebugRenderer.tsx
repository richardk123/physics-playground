import p5Types from "p5";
import {Transformer} from "../../../engine/common/Transformer";
import {Vec2d} from "../../../engine/data/Vec2d";
import {registerMoving, registerScrolling} from "../utils/CanvasUtils";
import {P5Renderer} from "../../../../components/P5Renderer";
import {Engine} from "../../../engine/Engine";

export const CollisionDebugRenderer = ({engine}: {engine: Engine}) =>
{
    const render = (p5: p5Types, canvas: HTMLCanvasElement) =>
    {
        const particles = engine.solver.particlesBuffer.gpuParticles;
        const collision = engine.solver.collisionBuffer.gpuCollision;
        const settings = engine.solver.settingsBuffer.settings;
        const camera = engine.renderer.cameraBuffer.camera;

        const transform = new Transformer(camera, canvas);

        // render particles
        for (let i = 0; i < particles.count; i++)
        {
            const x = particles.positionCurrent[i * 2 + 0];
            const y = particles.positionCurrent[i * 2 + 1];

            const tSize = transform.toClipSpace().size(1);

            const p = transform.toClipSpace().position(x, y);
            // p5.circle(p.x, p.y, tSize);

            // const tPrev = transform.toClipSpace().position(prevX, prevY);
            // p5.circle(tPrev.x, tPrev.y, tSize);

            const collisionCount = collision.particleCollisionCount[i];
            if (collisionCount > 0)
            {
                const particlePositions: string[] = [];
                for (let j = 0; j < collisionCount; j++)
                {
                    const vx = collision.particleCollisionVelocities[(i * 8 * 2) + 0 + j];
                    const vy = collision.particleCollisionVelocities[(i * 8 * 2) + 1 + j];

                    particlePositions.push(`[${vx.toFixed(3)}, ${vy.toFixed(3)}]`)
                }
                p5.text(`[${particlePositions.join(", ")}]`, p.x, p.y - transform.toClipSpace().size(0.5));
                p5.text(collisionCount.toFixed(0), p.x, p.y);
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