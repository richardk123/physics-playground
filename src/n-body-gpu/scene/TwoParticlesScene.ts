import {Engine} from "../engine/Engine";
import {Particles} from "../engine/data/Particles";
import {EngineSettings} from "../engine/data/EngineSettings";

export const twoParticlesScene = async (canvas: HTMLCanvasElement) => {
    const particles = new Particles();

    particles.addParticle(2, 2);
    particles.addParticle(3.2, 2);

    const settings: EngineSettings = {cameraX: 0, cameraY: 0, zoom: 0.025, gridSizeX: 6, gridSizeY: 5, performance: false, debug: false};

    return await Engine.create(canvas, particles, settings);
}