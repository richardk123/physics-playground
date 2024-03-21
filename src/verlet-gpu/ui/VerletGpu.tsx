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

                const size = 2;
                const bbSize = size + 5;

                engine.getWorldBoundingBox().topRight.x = bbSize;
                engine.getWorldBoundingBox().topRight.y = bbSize;
                engine.getWorldBoundingBox().bottomLeft.x = 0;
                engine.getWorldBoundingBox().bottomLeft.y = 0;
                engine.getCamera().translation.x = bbSize / 2;
                engine.getCamera().translation.y = bbSize / 2;
                engine.getSettings().gravity.y = -10;
                engine.getSettings().gridCellSize = 1;
                engine.getSettings().deltaTime = 1 / 60;
                engine.getCamera().zoom = 0.038;
                // engine.getCamera().zoom = 1.5;
                // engine.getCamera().zoom = 0.03;

                // for (let i = -50; i < 50; i++)
                // {
                //     const color: Color = {r: ((50 + i) + 0.001) / 100, g: 0.1, b: 0.1, a: 1.0};
                //     engine.createRectangle(i, -50, 1, 100, 1, color);
                // }

                engine.createRectangle(0, 0, size, size);
                // engine.createRectangle(0, 0, 1, 2);

                engine.start().then(e =>
                {
                    console.log("start");
                });
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