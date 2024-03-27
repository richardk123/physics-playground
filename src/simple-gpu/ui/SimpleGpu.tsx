import React, {useEffect, useState} from "react";
import {Engine} from "../engine/Engine";
import {EngineSettings} from "../engine/data/EngineSettings";
import {SimulationControls} from "./components/SimulationControls";
import {GpuSettingsInfo} from "./components/GpuSettingsInfo";
import {Camera} from "../engine/data/Camera";
import {ParticlesDebugRenderer} from "./components/debug/ParticlesDebugRenderer";

export const SimpleGpu = () =>
{
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [engine, setEngine] = useState<Engine | undefined>();

    useEffect(() =>
    {
        const settings: EngineSettings = {
            maxParticleCount: 10000,
            gridSizeY: 100,
            gridSizeX: 100,
        }
        const camera: Camera = {
            zoom: 0.05,
            translation: {x: 10, y: 5},
            rotation: 0,
        }

        Engine.create(canvasRef.current!, settings, camera)
            .then(async engine =>
            {
                setEngine(engine);

                engine.addPoint(0, 0);
                engine.addPoint(5, 10);

                await engine.next();
            })
    }, []);

    return <div className="flex h-full bg-gray-200">
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex">
                <div className="w-1/2 bg-gray-200">
                    <canvas className="w-full h-full" ref={canvasRef} width={1008} height={652}></canvas>
                </div>
                <div className="w-1/2 bg-gray-300">
                    <ParticlesDebugRenderer engine={engine} />
                </div>
            </div>
        </div>
        <div className="w-64 text-white">
            <SimulationControls engine={engine} />
            <GpuSettingsInfo engine={engine} />
        </div>
    </div>;
}