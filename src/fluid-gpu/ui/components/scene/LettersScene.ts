import {EngineSettings} from "../../../engine/data/EngineSettings";
import {Vec2d} from "../../../engine/data/Vec2d";
import {Camera} from "../../../engine/data/Camera";
import {Engine} from "../../../engine/Engine";
import {Colors} from "../../../engine/data/Color";
import {Letters} from "../../../engine/utils/Letters";

export const createLettersScene = async (canvas: HTMLCanvasElement) =>
{
    const count = 512;

    const settings: EngineSettings = {
        maxParticleCount: 1000000,
        maxMaterialCount: 100,
        gridSizeY: count,
        gridSizeX: count,
        subStepCount: 6,
        deltaTime: 1 / 60,
        cellSize: 1.2,
        gravity: {x: 0, y: 0},
        debug: false,
        performance: false,
        solveCollisions: true,
        solveDensity: false
    }
    const translation: Vec2d = {
        x: 252,
        y: 171
    }
    const camera: Camera = {
        zoom: 0.43385,
        translation: translation,
        rotation: 0,
    }

    const engine = await Engine.create(canvas, settings, camera);

    const m1 = engine.addMaterial({targetDensity: 5.0, smoothingRadius: 1.6, pressureMultiplier: 100});

    const letters = new Letters(engine);

    for (let j = 0; j < 20; j++)
    {
        for (let i = 0; i < 80; i ++)
        {
            letters.A(10 + i * 6, 10 + j * 6, Colors.green(), m1, 1);
        }
    }

    for (let j = 0; j < 20; j++)
    {
        for (let i = 0; i < 80; i ++)
        {
            letters.B(10 + i * 6, 200 + j * 6, Colors.red(), m1, 1);
        }
    }

    // for (let y = 0; y < 512; y++)
    // {
    //     for (let x = 0; x < 512; x++)
    //     {
    //         engine.addPoint(x, y, 1, Colors.red(), m1);
    //     }
    // }

    engine.addPoint(Math.floor(256 * 1.2), Math.floor(256 * 1.2), 1, Colors.red(), 0);

    console.log("scene1 created");

    return engine;
}