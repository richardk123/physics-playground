import {Engine} from "../engine/Engine";
import {Particles} from "../engine/data/Particles";
import {EngineSettings} from "../engine/data/EngineSettings";

export const oneStarScene = async (canvas: HTMLCanvasElement) => {
    const particles = new Particles();

    const center1X = 300; // Center of the first circle
    const center1Y = 500; // Center of the first circle
    const center2X = 700; // Center of the second circle
    const center2Y = 600; // Center of the second circle
    const radius = 200;   // Radius of the circles
    const totalParticles = 200000; // Total number of particles
    const halfParticles = totalParticles / 2; // Particles per circle
    const speed = 1.05;

    for (let i = 0; i < totalParticles; i++) {
        // Generate a random angle and radius
        const angle = Math.random() * 2 * Math.PI; // Full circle
        const r = Math.sqrt(Math.random()) * radius; // Square root for uniform distribution

        let x, y, vx, vy;

        if (i < halfParticles) {
            // Particles in the first circle
            x = center1X + r * Math.cos(angle) + Math.random();
            y = center1Y + r * Math.sin(angle) + Math.random();

            // Velocity pointing toward the second circle's center
            const directionX = center2X - center1X;
            const directionY = center2Y - center1Y;
            const magnitude = Math.sqrt(directionX ** 2 + directionY ** 2);
            vx = (directionX / magnitude) * speed; // Normalize and scale
            vy = 0;
        } else {
            // Particles in the second circle
            x = center2X + r * Math.cos(angle) + Math.random();
            y = center2Y + r * Math.sin(angle) + Math.random();

            // Velocity pointing toward the first circle's center
            const directionX = center1X - center2X;
            const directionY = center1Y - center2Y;
            const magnitude = Math.sqrt(directionX ** 2 + directionY ** 2);
            vx = (directionX / magnitude) * speed; // Normalize and scale
            vy = 0;
        }

        particles.addParticle(x, y, vx, vy);
    }

    const settings: EngineSettings = {cameraX: -10, cameraY: -10, zoom: 1.0, gridSizeX: 2048, gridSizeY: 2048, performance: false, debug: false};

    return await Engine.create(canvas, particles, settings);
}