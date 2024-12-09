import {Engine} from "../engine/Engine";
import {Particles} from "../engine/data/Particles";
import {EngineSettings} from "../engine/data/EngineSettings";

export const twoStarsScene = async (canvas: HTMLCanvasElement) => {
    const particles = new Particles();

    const createStar = (centerX: number, centerY: number, radius: number) => {
        const totalParticles = 200000; // Total number of particles

        for (let i = 0; i < totalParticles; i++) {
            // Generate a random angle and radius
            const angle = Math.random() * 2 * Math.PI; // Angle in radians
            const r = Math.sqrt(Math.random()) * radius; // Square root for uniform distribution

            // Convert polar coordinates to Cartesian coordinates
            const x = centerX + r * Math.cos(angle);
            const y = centerY + r * Math.sin(angle);

            particles.addParticle(x, y);
        }
    }

    createStar(700, 700, 300);
    createStar(1000, 1200, 300);

    const settings: EngineSettings = {cameraX: 406, cameraY: 525, zoom: 1.0, gridSizeX: 2048, gridSizeY: 2048, performance: false, debug: false};

    return await Engine.create(canvas, particles, settings);
}