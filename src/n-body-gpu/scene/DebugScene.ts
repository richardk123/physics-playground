import {Engine} from "../engine/Engine";
import {Particles} from "../engine/data/Particles";
import {EngineSettings} from "../engine/data/EngineSettings";

export const debugScene = async (canvas: HTMLCanvasElement) => {
    const particles = new Particles();

    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 5; x++) {
            particles.addParticle(x, y);
        }
    }

    console.log(particles);

    const settings: EngineSettings = {cameraX: 0, cameraY: 0, zoom: 0.025, gridSizeX: 5, gridSizeY: 4, performance: false, debug: false};

    return await Engine.create(canvas, particles, settings);
}