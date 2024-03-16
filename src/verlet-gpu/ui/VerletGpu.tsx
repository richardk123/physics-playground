import React, {useEffect, useState} from "react";
import {Engine} from "../engine/Engine";
import {SettingsSidebar} from "./SettingsSidebar";
import {Color} from "../engine/data/Color";

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

                const size = 1000;
                const bbSize = size + 5;

                engine.getWorldBoundingBox().topRight.x = bbSize / 2;
                engine.getWorldBoundingBox().topRight.y = bbSize / 2;
                engine.getWorldBoundingBox().bottomLeft.x = -bbSize / 2;
                engine.getWorldBoundingBox().bottomLeft.y = -bbSize / 2;
                engine.getCamera().zoom = 1.5;

                // for (let i = -50; i < 50; i++)
                // {
                //     const color: Color = {r: ((50 + i) + 0.001) / 100, g: 0.1, b: 0.1, a: 1.0};
                //     engine.createRectangle(i, -50, 1, 100, 1, color);
                // }

                engine.createRectangle(-size / 2, -size / 2, size, size);

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