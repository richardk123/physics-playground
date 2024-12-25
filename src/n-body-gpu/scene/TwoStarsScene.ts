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

    type StarConfig = {
        centerX: number;
        centerY: number;
        radius: number;
    };

    const createNStars = (stars: StarConfig[], orbitSpeed: number): void => {

        // Calculate the middle point between all stars
        const middlePoint = stars.reduce(
            (acc, star) => ({
                x: acc.x + star.centerX,
                y: acc.y + star.centerY,
            }),
            { x: 0, y: 0 }
        );

        middlePoint.x /= stars.length;
        middlePoint.y /= stars.length;

        // Create each star with the calculated middle point as the orbit center
        stars.forEach((star) => {
            createStar(star.centerX, star.centerY, star.radius, middlePoint.x, middlePoint.y, orbitSpeed);
        });
    };

    createNStars(
        [
            {centerX: 800, centerY: 200, radius: 140},
            {centerX: 700, centerY: 500, radius: 140},
            {centerX: 400, centerY: 600, radius: 140},
            {centerX: 700, centerY: 800, radius: 140}
        ],
        2.3);

    const settings: EngineSettings = {cameraX: 0, cameraY: 0, zoom: 1.0, gridSizeX: 1280, gridSizeY: 1280, performance: false, debug: false};

    return await Engine.create(canvas, particles, settings);
}