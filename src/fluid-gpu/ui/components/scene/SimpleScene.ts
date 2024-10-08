import {EngineSettings} from "../../../engine/data/EngineSettings";
import {Vec2d} from "../../../engine/data/Vec2d";
import {Camera} from "../../../engine/data/Camera";
import {Engine} from "../../../engine/Engine";
import {Colors} from "../../../engine/data/Color";

export const createSimpleScene = async (canvas: HTMLCanvasElement) =>
{
    const count = 256;

    const settings: EngineSettings = {
        maxParticleCount: 400000,
        maxMaterialCount: 100,
        gridSizeY: count,
        gridSizeX: count,
        subStepCount: 6,
        deltaTime: 1 / 60,
        cellSize: 1.2,
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

    const m1 = engine.addMaterial({targetDensity: 2.0, smoothingRadius: 1.8, pressureMultiplier: 100});

    engine.createRectangleRandom(0, 0,
        250, 250, 1, Colors.blue(), m1, 0.7);

    console.log("scene1 created");

    return engine;
}