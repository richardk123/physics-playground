import {Engine} from "../engine/Engine";
import {Particles} from "../engine/data/Particles";
import {EngineSettings} from "../engine/data/EngineSettings";

export const debugScene = async (canvas: HTMLCanvasElement) => {
    const particles = new Particles();

    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 5; x++) {
            particles.addParticle(20 + x, 20 + y);
        }
    }

    console.log(particles);

    const settings: EngineSettings = {cameraX: -5, cameraY: -5, zoom: 0.035, gridSizeX: 25, gridSizeY: 24, performance: false, debug: false};

    return await Engine.create(canvas, particles, settings);
}