import {EngineSettings} from "../../../engine/data/EngineSettings";
import {Vec2d} from "../../../engine/data/Vec2d";
import {Camera} from "../../../engine/data/Camera";
import {Engine} from "../../../engine/Engine";
import {Colors} from "../../../engine/data/Color";

export const createScene2 = async (canvas: HTMLCanvasElement) =>
{
    const count = 256;

    const settings: EngineSettings = {
        maxParticleCount: 1000000,
        maxMaterialCount: 100,
        gridSizeY: count,
        gridSizeX: count,
        subStepCount: 8,
        deltaTime: 1 / 60,
        cellSize: 1.3 / Math.sqrt(2),
        gravity: {x: 0, y: -10},
        debug: false,
        performance: false,
        solveDensity: true,
        solveCollisions: false,
    }

    const translation: Vec2d = {
        x: 155.15,
        y: 109.89
    }
    const camera: Camera = {
        zoom: 0.25770,
        translation: translation,
        rotation: 0,
    }

    const engine = await Engine.create(canvas, settings, camera);

    const m1 = engine.addMaterial({targetDensity: 5.0, smoothingRadius: 1.25, pressureMultiplier: 40});
    const m2 = engine.addMaterial({targetDensity: 5.0, smoothingRadius: 1.1, pressureMultiplier: 10});

    const fullWidth = Math.floor((settings.cellSize * count) / 0.5);
    engine.createRectangleRandom(0, 10, 50, fullWidth / 2, 1, Colors.blue(), m1);
    engine.createRectangleRandom(100, 10, 50, fullWidth / 2, 1.2, Colors.green(), m2);
    engine.createRectangleRandom(300, 10, 50, fullWidth / 2, 1.4, Colors.red(), m1);
    engine.createRectangleRandom(400, 10, 50, fullWidth / 2, 1.6, Colors.white(), m2);

    return engine;
}