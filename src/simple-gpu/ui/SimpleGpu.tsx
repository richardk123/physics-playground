import React, {useEffect, useState} from "react";
import {Engine} from "../engine/Engine";
import {EngineSettings} from "../engine/data/EngineSettings";
import {Camera} from "../engine/data/Camera";
import {registerMoving, registerScrolling} from "./components/utils/CanvasUtils";
import {Sidebar} from "./components/Sidebar";
import {GridDebugRenderer} from "./components/debug/GridDebugRenderer";
import {ParticlesDebugRenderer} from "./components/debug/ParticlesDebugRenderer";
import {DensityDebugRenderer} from "./components/debug/DensityDebugRenderer";

export const SimpleGpu = () =>
{
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [engine, setEngine] = useState<Engine | undefined>();

    // must be power of 8
    const count = 256;

    useEffect(() =>
    {
        const settings: EngineSettings = {
            maxParticleCount: 400000,
            gridSizeY: count * 2,
            gridSizeX: count,
            subStepCount: 8,
            deltaTime: 1 / 60,
            cellSize: 1.2 / Math.sqrt(2),
            gravity: {x: 0, y: -10},
            debug: false,
        }
        const camera: Camera = {
            zoom: 0.0007 * settings.gridSizeX,
            translation: {x: count / 2 - 10, y: count / 4},
            rotation: 0,
        }
        const canvas = canvasRef.current!;

        Engine.create(canvas, settings, camera)
            .then(async engine =>
            {
                setEngine(engine);

                const fullWidth = Math.floor((settings.cellSize * count) / 1.1);
                engine.createRectangleRandom(0, 0, fullWidth, 128);

                registerScrolling(canvas, camera);
                registerMoving(canvas, camera);

                await engine.next();
                engine.render()
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
                <canvas className="w-full h-full" ref={canvasRef} width={1980} height={1280}></canvas>
            </div>
        </div>
        <div className="w-64 h-full text-white">
            {engine && <Sidebar engine={engine}/>}
        </div>
    </div>;
}