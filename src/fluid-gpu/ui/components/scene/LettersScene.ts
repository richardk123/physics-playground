import {EngineSettings} from "../../../engine/data/EngineSettings";
import {Vec2d} from "../../../engine/data/Vec2d";
import {Camera} from "../../../engine/data/Camera";
import {Engine} from "../../../engine/Engine";
import {Colors} from "../../../engine/data/Color";

export const createLettersScene = async (canvas: HTMLCanvasElement) =>
{
    const count = 256;

    const settings: EngineSettings = {
        maxParticleCount: 1000000,
        maxMaterialCount: 100,
        gridSizeY: count,
        gridSizeX: count,
        subStepCount: 8,
        deltaTime: 1 / 60,
        cellSize: 1.2,
        gravity: {x: 0, y: 0},
        debug: false,
        performance: false,
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

    const m1 = engine.addMaterial({targetDensity: 5.0, smoothingRadius: 1.6, pressureMultiplier: 100});
    const m2 = engine.addMaterial({targetDensity: 5.0, smoothingRadius: 1.3, pressureMultiplier: 30});

    const fullWidth = Math.floor((settings.cellSize * count) / 1.1);
    const height = fullWidth / 10;

    const particleDistance = 1.05;
    engine.createRectangle(0, 0,
        fullWidth, height,
        2, Colors.blue(),
        m1, particleDistance);

    engine.createRectangle(0, height,
        fullWidth, height,
        1, Colors.green(),
        m2, particleDistance);

    console.log("scene1 created");

    return engine;
}