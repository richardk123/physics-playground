import {Engine} from "../engine/Engine";
import {Particles} from "../engine/data/Particles";
import {GridBuffer} from "../engine/data/Grid";
import {EngineSettings} from "../engine/data/EngineSettings";

export const fullParticleScene = async (canvas: HTMLCanvasElement) => {
    const particles = new Particles();

    for (let y = 0; y < 2048; y++) {
        for (let x = 0; x < 2048; x++) {
            if (Math.random() < 0.5) {
                particles.addParticle(x, y);
            }
        }
    }

    const settings: EngineSettings = {cameraX: -372, cameraY: -36, zoom: 2.2, gridSizeX: 2048, gridSizeY: 2048, performance: false, debug: false};

    return await Engine.create(canvas, particles, settings);
}