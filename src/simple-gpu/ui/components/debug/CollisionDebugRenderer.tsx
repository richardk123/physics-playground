import p5Types from "p5";
import {Transformer} from "../../../engine/common/Transformer";
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

        if (!settings.debug)
        {
            return;
        }

        // const transform = new Transformer(camera, canvas);
        //
        // // render particles
        // for (let i = 0; i < particles.count; i++)
        // {
        //     const x = particles.positionCurrent[i * 2 + 0];
        //     const y = particles.positionCurrent[i * 2 + 1];
        //
        //     const p = transform.toClipSpace().position(x, y);
        //
        //     const collisionCount = collision.particleUpdateCount[i];
        //     if (collisionCount > 0)
        //     {
        //         p5.text(collisionCount.toFixed(0), p.x, p.y);
        //     }
        // }

    }

    const setup = (p5: p5Types, canvas: HTMLCanvasElement) =>
    {
        const camera = engine.renderer.cameraBuffer.camera;
        registerMoving(canvas, camera);
        registerScrolling(canvas, camera);
    }

    return <P5Renderer render={render} setup={setup} />
}