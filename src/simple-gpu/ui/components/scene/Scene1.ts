import {EngineSettings} from "../../../engine/data/EngineSettings";
import {Vec2d} from "../../../engine/data/Vec2d";
import {Camera} from "../../../engine/data/Camera";
import {Engine} from "../../../engine/Engine";
import {Colors} from "../../../engine/data/Color";
import {registerMoving, registerScrolling} from "../utils/CanvasUtils";
import {EngineSingleton} from "./EngineSingleton";

export const createScene1 = async (canvas: HTMLCanvasElement) =>
{
    const count = 256;

    const settings: EngineSettings = {
        maxParticleCount: 1000000,
        gridSizeY: count,
        gridSizeX: count,
        subStepCount: 8,
        deltaTime: 1 / 60,
        cellSize: 1.3 / Math.sqrt(2),
        gravity: {x: 0, y: -10},
        debug: false,
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

    const fullWidth = Math.floor((settings.cellSize * count) / 0.5);
    engine.createRectangleRandom(0, 0,
        fullWidth, fullWidth / 6,
        1.7, Colors.blue())

    engine.createRectangleRandom(0, fullWidth / 6,
        fullWidth, fullWidth / 6,
        1, Colors.green())

    // registerScrolling(canvas, camera);
    // registerMoving(canvas, camera);

    EngineSingleton.set(engine);
    console.log("scene1 created");

    return engine;
}