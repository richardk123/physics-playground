import {Engine} from "../engine/Engine";
import {Particles} from "../engine/data/Particles";
import {EngineSettings} from "../engine/data/EngineSettings";

export const twoParticleScene = async (canvas: HTMLCanvasElement) => {
    const particles = new Particles();

    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            particles.addParticle(x, y);
        }
    }

    const settings: EngineSettings = {cameraX: 1, cameraY: 1, zoom: 1, gridSizeX: 10, gridSizeY: 10, performance: false, debug: false};

    return await Engine.create(canvas, particles, settings);
}