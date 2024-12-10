import {Engine} from "../engine/Engine";
import {Particles} from "../engine/data/Particles";
import {EngineSettings} from "../engine/data/EngineSettings";

export const twoStarsScene = async (canvas: HTMLCanvasElement) => {
    const particles = new Particles();
    const totalParticles = 400000; // Total number of particles

    const createStar = (
        centerX: number, centerY: number,
        radius: number,
        orbitCenterX: number, orbitCenterY: number, orbitSpeed: number
    ) => {
        const totalSteps = 1000; // Number of steps for radius distribution
        const particlesPerStep = totalParticles / totalSteps; // Particles to generate per radial step

        // Generate particles
        for (let step = 0; step <= totalSteps; step++) {
            const r = (step / totalSteps) * radius; // Linearly increase radius from 0 to max
            const densityFactor = r / radius; // Linearly increase density with radius
            const numParticles = Math.round(densityFactor * particlesPerStep); // Adjust number of particles

            for (let j = 0; j < numParticles; j++) {
                const angle = Math.random() * 2 * Math.PI; // Random angle

                // Convert polar coordinates to Cartesian coordinates
                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);

                // Calculate vector from orbit center to particle
                const dx = x - orbitCenterX;
                const dy = y - orbitCenterY;

                // Calculate perpendicular velocity for circular orbit
                const magnitude = Math.sqrt(dx * dx + dy * dy); // Distance from orbit center
                const unitDx = dx / magnitude; // Unit vector in the radial direction
                const unitDy = dy / magnitude;

                const velocityX = -unitDy * orbitSpeed;
                const velocityY = unitDx * orbitSpeed;

                particles.addParticle(x, y, velocityX, velocityY);
            }
        }
    };

    const createTwoStars = (
        centerX1: number, centerY1: number, radius1: number,
        centerX2: number, centerY2: number, radius2: number,
        orbitSpeed: number
    ): void => {
        // Calculate the middle point between the stars
        const middlePoint = {
            x: (centerX1 + centerX2) / 2,
            y: (centerY1 + centerY2) / 2,
        };

        // Create the first star
        createStar(centerX1, centerY1, radius1, middlePoint.x, middlePoint.y, orbitSpeed);

        // Create the second star
        createStar(centerX2, centerY2, radius2, middlePoint.x, middlePoint.y, orbitSpeed);
    };

    createTwoStars(
        600, 200, 200,
        600, 500, 200,
        2.5);

    const settings: EngineSettings = {cameraX: 0, cameraY: 0, zoom: 1.0, gridSizeX: 1280, gridSizeY: 1280, performance: false, debug: false};

    return await Engine.create(canvas, particles, settings);
}