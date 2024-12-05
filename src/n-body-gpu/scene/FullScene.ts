import {Engine} from "../engine/Engine";
import {Particles} from "../engine/data/Particles";
import {Camera} from "../engine/data/Camera";
import {GridBuffer} from "../engine/data/Grid";

export const fullParticleScene = async (canvas: HTMLCanvasElement) => {
    const particles = new Particles();

    for (let y = 0; y < GridBuffer.GRID_SIZE; y++) {
        for (let x = 0; x < GridBuffer.GRID_SIZE; x++) {
            if (Math.random() < 0.5) {
                particles.addParticle(x, y);
            }
        }
    }

    const camera: Camera = {x: 0, y: 0, zoom: 2};

    return await Engine.create(canvas, particles, camera);
}