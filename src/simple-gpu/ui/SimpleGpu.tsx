import React, {useEffect, useState} from "react";
import {Engine} from "../engine/Engine";
import {EngineSettings} from "../engine/data/EngineSettings";
import {Camera} from "../engine/data/Camera";
import {registerMoving, registerScrolling} from "./components/utils/CanvasUtils";
import {Sidebar} from "./components/Sidebar";
import {GridDebugRenderer} from "./components/debug/GridDebugRenderer";
import {ParticlesDebugRenderer} from "./components/debug/ParticlesDebugRenderer";
import {DensityDebugRenderer} from "./components/debug/DensityDebugRenderer";
import {Colors} from "../engine/data/Color";
import {Vec2d} from "../engine/data/Vec2d";

export const SimpleGpu = () =>
{
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [engine, setEngine] = useState<Engine | undefined>();

    // must be power of 8
    const count = 256;

    useEffect(() =>
    {
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
            x: (settings.gridSizeX / 2) * settings.cellSize,
            y: (settings.gridSizeY / 2) * settings.cellSize
        }
        const camera: Camera = {
            zoom: 0.38718,
            translation: translation,
            rotation: 0,
        }
        const canvas = canvasRef.current!;

        Engine.create(canvas, settings, camera)
            .then(async engine =>
            {
                setEngine(engine);

                const fullWidth = Math.floor((settings.cellSize * count) / 1.1);
                // engine.createRectangleRandom(0, 0, fullWidth, fullWidth / 2, Colors.blue());

                engine.createRectangleRandom(0, 0,
                    fullWidth / 2, fullWidth / 1,
                    1.0, Colors.blue());

                engine.createRectangleRandom((fullWidth / 2) * 1.1, 0,
                    fullWidth / 2 - 10, fullWidth / 1,
                    1.0, Colors.green());

                // engine.createRectangleRandom(0, 0,
                //     fullWidth / 2, fullWidth / 3 - 10,
                //     5, Colors.blue())
                //
                // engine.createRectangleRandom(0, (fullWidth / 2) * 1.1,
                //     fullWidth, fullWidth / 3,
                //     1, Colors.red())

                registerScrolling(canvas, camera);
                registerMoving(canvas, camera);

                await engine.next();
                engine.render();
            })
    }, []);
    //
    // return <div className="flex h-full bg-gray-200">
    //     <div className="flex-1 flex flex-col h-full">
    //         <div className="flex h-1/2">
    //             <canvas className="w-full h-full" ref={canvasRef} width={1980} height={1280}></canvas>
    //             {engine && <ParticlesDebugRenderer engine={engine} />}
    //         </div>
    //         <div className="flex h-1/2">
    //             {engine && <GridDebugRenderer engine={engine} />}
    //             {engine && <DensityDebugRenderer engine={engine} />}
    //         </div>
    //     </div>
    //     <div className="w-64 h-full text-white">
    //         {engine && <Sidebar engine={engine}/>}
    //     </div>
    // </div>;

    return <div className="flex h-full bg-gray-200">
        <div className="flex-1 flex flex-col h-full">
            <div className="flex h-full">
                <canvas className="w-full h-full" ref={canvasRef} width={1980} height={1080}></canvas>
            </div>
        </div>
        <div className="w-64 h-full text-white">
            {engine && <Sidebar engine={engine}/>}
        </div>
    </div>;
}