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
        subStepCount: 8,
        deltaTime: 1 / 60,
        cellSize: 1.3 / Math.sqrt(2),
        gravity: {x: 0, y: -10},
        debug: false,
        performance: false,
    }
    const translation: Vec2d = {
        x: (settings.gridSizeX / 2) * 0.9,
        y: (settings.gridSizeY / 2) * 0.9
    }
    const camera: Camera = {
        zoom: 0.38718,
        translation: translation,
        rotation: 0,
    }

    const engine = await Engine.create(canvas, settings, camera);

    const m1 = engine.addMaterial({targetDensity: 3.0, smoothingRadius: 1.8, pressureMultiplier: 100});

    const width = Math.floor((settings.cellSize * count) / 0.5);
    const height = width / 5;

    engine.createRectangleRandom(0, 0,
        width, height, 1, Colors.blue(), m1);

    console.log("scene1 created");

    return engine;
}