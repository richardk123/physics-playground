import React, {useEffect, useState} from "react";
import {Engine} from "../engine/Engine";
import {EngineSettings} from "../engine/data/EngineSettings";
import {SimulationControls} from "./components/SimulationControls";
import {GpuSettingsInfo} from "./components/GpuSettingsInfo";
import {Camera} from "../engine/data/Camera";

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
            zoom: 0.1,
            translation: {x: 0, y: 0},
            rotation: 0,
        }

        Engine.create(canvasRef.current!, settings, camera)
            .then(engine =>
            {
                setEngine(engine);

                engine.addPoint(0, 0);
                engine.addPoint(2, 1);

                engine.next();
            })
    }, []);

    return <div className="flex h-full bg-gray-200">
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-x-hidden overflow-y-auto h-full w-full">
                <canvas className="w-full h-full" ref={canvasRef} width={1980} height={1280}></canvas>
            </div>
        </div>
        <div className="w-64 text-white">
            <SimulationControls engine={engine} />
            <GpuSettingsInfo engine={engine} />
        </div>
    </div>;
}