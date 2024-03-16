import React, {useEffect, useState} from "react";
import {Engine} from "../engine/Engine";
import {SettingsSidebar} from "./SettingsSidebar";

export const VerletGpu = () =>
{
    const [engine, setEngine] = useState<Engine | undefined>();
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    useEffect(function ()
    {
        Engine.create(canvasRef.current!)
            .then(engine =>
            {
                setEngine(engine);

                engine.getWorldBoundingBox().topRight.x = 50;
                engine.getWorldBoundingBox().topRight.y = 50;
                engine.getWorldBoundingBox().bottomLeft.x = -50;
                engine.getWorldBoundingBox().bottomLeft.y = -50;
                engine.getCamera().zoom = 0.162
                ;
                engine.createRectangle(-50, -50, 100, 100);

                engine.start();
            });
    }, []);

    return <div className="flex h-full bg-gray-200">
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 h-full w-full">
                <canvas className="w-full h-full" ref={canvasRef} width={1980} height={1280}></canvas>
            </div>
        </div>
        <div className="w-64 text-white">
            {engine === undefined ? <></> : <SettingsSidebar engine={engine} />}
        </div>
    </div>;
}