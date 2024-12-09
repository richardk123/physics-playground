import { Engine } from "../engine/Engine";
import { Particles } from "../engine/data/Particles";
import { EngineSettings } from "../engine/data/EngineSettings";

export const randomShapesScene = async (canvas: HTMLCanvasElement) => {
    const particles = new Particles();

    const canvasWidth = 1024; // Width of the scene
    const canvasHeight = 1024; // Height of the scene
    const totalShapes = 100; // Number of small blob shapes
    const particlesPerBlob = 5000; // Number of particles per blob
    const blobRadius = 200; // Approximate radius of each blob
    const totalGasParticles = 200000; // Number of gas particles

    // Generate small blob shapes
    for (let i = 0; i < totalShapes; i++) {
        const centerX = Math.random() * canvasWidth;
        const centerY = Math.random() * canvasHeight;

        for (let j = 0; j < particlesPerBlob; j++) {
            // Generate particles within a circular blob
            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * blobRadius;

            const x = centerX + distance * Math.cos(angle);
            const y = centerY + distance * Math.sin(angle);

            const velocityX = (Math.random() - 0.5) * 0.1;
            const velocityY = (Math.random() - 0.5) * 0.1;

            particles.addParticle(x, y, velocityX, velocityY);
        }
    }

    // Generate randomly distributed gas particles
    for (let i = 0; i < totalGasParticles; i++) {
        const x = Math.random() * canvasWidth;
        const y = Math.random() * canvasHeight;

        const velocityX = 0; // Gas particles are stationary
        const velocityY = 0;

        particles.addParticle(x, y, velocityX, velocityY); // Add semi-transparent gas
    }

    const settings: EngineSettings = {
        cameraX: 0,
        cameraY: 0,
        zoom: 1.0,
        gridSizeX: canvasWidth + 500,
        gridSizeY: canvasHeight + 500,
        performance: false,
        debug: false
    };

    return await Engine.create(canvas, particles, settings);
}
