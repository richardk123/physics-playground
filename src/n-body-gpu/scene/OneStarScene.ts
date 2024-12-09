import {Engine} from "../engine/Engine";
import {Particles} from "../engine/data/Particles";
import {EngineSettings} from "../engine/data/EngineSettings";

export const oneStarScene = async (canvas: HTMLCanvasElement) => {
    const particles = new Particles();

    const centerX = 1024; // Center of the circle
    const centerY = 1024; // Center of the circle
    const radius = 500;  // Radius of the circle
    const totalParticles = 200000; // Total number of particles

    for (let i = 0; i < totalParticles; i++) {
        // Generate a random angle and radius
        const angle = Math.random() * 2 * Math.PI; // Angle in radians
        const r = Math.sqrt(Math.random()) * radius; // Square root for uniform distribution

        // Convert polar coordinates to Cartesian coordinates
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);

        particles.addParticle(x, y, Math.random() * 0.1, Math.random() * 0.1);
    }

    const settings: EngineSettings = {cameraX: 512, cameraY: 512, zoom: 1.0, gridSizeX: 2048, gridSizeY: 2048, performance: false, debug: false};

    return await Engine.create(canvas, particles, settings);
}