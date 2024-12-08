import {Engine} from "../engine/Engine";
import {Particles} from "../engine/data/Particles";
import {Camera} from "../engine/data/Camera";

export const randomParticlesScene = async (canvas: HTMLCanvasElement) => {
    const particles = new Particles();

    const centerX = 1024; // Center of the circle
    const centerY = 1024; // Center of the circle
    const radius = 550;  // Radius of the circle
    const totalParticles = 2000000; // Total number of particles

    for (let i = 0; i < totalParticles; i++) {
        // Generate a random angle and radius
        const angle = Math.random() * 2 * Math.PI; // Angle in radians
        const r = Math.sqrt(Math.random()) * radius; // Square root for uniform distribution

        // Convert polar coordinates to Cartesian coordinates
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);

        particles.addParticle(x, y);
    }

    const camera: Camera = {x: 400, y: 400, zoom: 1.0};

    return await Engine.create(canvas, particles, camera);
}