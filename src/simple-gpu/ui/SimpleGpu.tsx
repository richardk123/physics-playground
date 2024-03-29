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

    useEffect(() =>
    {
        const settings: EngineSettings = {
            maxParticleCount: 10000,
            gridSizeY: 10,
            gridSizeX: 10,
            subStepCount: 4,
            deltaTime: 1 / 60,
            debug: true,
        }
        const camera: Camera = {
            zoom: 0.05,
            translation: {x: 0, y: 0},
            rotation: 0,
        }
        const canvas = canvasRef.current!;

        Engine.create(canvas, settings, camera)
            .then(async engine =>
            {
                setEngine(engine);

                engine.addPoint(2.5, 0);
                engine.addPoint(2.6, 7);
                engine.addPoint(2.4, 5);

                registerScrolling(canvas, camera);
                registerMoving(canvas, camera);

                await engine.next();
                engine.render()
            })
    }, []);

    return <div className="flex h-full bg-gray-200">
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex h-1/2">
                <div className="w-1/2 h-full bg-gray-200">
                    <canvas className="w-full h-full" ref={canvasRef} width={1024} height={768}></canvas>
                </div>
                <div className="w-1/2 h-full bg-gray-300">
                    {engine && <ParticlesDebugRenderer engine={engine} />}
                </div>
            </div>
            <div className="flex h-1/2">
                <div className="w-1/2 h-full bg-gray-200">
                    {engine && <GridDebugRenderer engine={engine} />}
                </div>
                <div className="w-1/2 h-full bg-gray-300">
                    {engine && <CollisionDebugRenderer engine={engine} />}
                </div>
            </div>
        </div>
        <div className="w-64 h-full text-white">
            {engine && <Sidebar engine={engine}/>}
        </div>
    </div>;
}