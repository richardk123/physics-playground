import {EngineSettings} from "../../../engine/data/EngineSettings";
import {Vec2d} from "../../../engine/data/Vec2d";
import {Camera} from "../../../engine/data/Camera";
import {Engine} from "../../../engine/Engine";
import {Colors} from "../../../engine/data/Color";
import {registerMoving, registerScrolling} from "../utils/CanvasUtils";
import {EngineSingleton} from "./EngineSingleton";

export const createScene2 = async (canvas: HTMLCanvasElement) =>
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
    EngineSingleton.set(engine);

    const fullWidth = Math.floor((settings.cellSize * count) / 0.5);
    engine.createRectangleRandom(0, 0, fullWidth, fullWidth / 2, 1, Colors.blue());

    // registerScrolling(canvas, camera);
    // registerMoving(canvas, camera);

    console.log("scene2 created");

    return engine;
}