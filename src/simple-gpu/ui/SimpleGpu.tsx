import React, {useEffect, useState} from "react";
import {Engine} from "../engine/Engine";
import {EngineSettings} from "../engine/data/EngineSettings";
import {Camera} from "../engine/data/Camera";
import {ParticlesDebugRenderer} from "./components/debug/ParticlesDebugRenderer";
import {GridDebugRenderer} from "./components/debug/GridDebugRenderer";
import {registerMoving, registerScrolling} from "./components/utils/CanvasUtils";
import {CollisionDebugRenderer} from "./components/debug/CollisionDebugRenderer";
import {Sidebar} from "./components/Sidebar";

export const SimpleGpu = () =>
{
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [engine, setEngine] = useState<Engine | undefined>();

    const count = 100;

    useEffect(() =>
    {
        const settings: EngineSettings = {
            maxParticleCount: 100000,
            gridSizeY: count * 2,
            gridSizeX: count * 2,
            subStepCount: 30,
            deltaTime: 1 / 60,
            gravity: {x: 0, y: -10},
            debug: false,
        }
        const camera: Camera = {
            zoom: 0.55,
            translation: {x: count, y: count},
            rotation: 0,
        }
        const canvas = canvasRef.current!;

        Engine.create(canvas, settings, camera)
            .then(async engine =>
            {
                setEngine(engine);

                engine.createRectangle(0, 0, count, count);

                registerScrolling(canvas, camera);
                registerMoving(canvas, camera);

                await engine.next();
                engine.render()
            })
    }, []);

    // return <div className="flex h-full bg-gray-200">
    //     <div className="flex-1 flex flex-col h-full">
    //         <div className="flex h-1/2">
    //             <canvas className="w-full h-full" ref={canvasRef} width={1980} height={1280}></canvas>
    //             {engine && <ParticlesDebugRenderer engine={engine} />}
    //         </div>
    //         <div className="flex h-1/2">
    //             {engine && <GridDebugRenderer engine={engine} />}
    //             {engine && <CollisionDebugRenderer engine={engine} />}
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