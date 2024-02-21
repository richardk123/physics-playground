import React, {useEffect} from "react";
import {createRenderer} from "./renderer/Renderer";

export const VerletGpu = () =>
{
    const canvasRef = React.useRef<HTMLCanvasElement>(null);


    useEffect(function () {
        createRenderer(canvasRef.current!).then(() =>
        {
            console.log("success");
        });
    }, []);

    return <div className="flex h-full bg-gray-200">
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 h-full w-full">
                <canvas className="w-full h-full" ref={canvasRef} width={1980} height={1280}></canvas>
            </div>
        </div>
        <div className="w-64 text-white">
            {/*<SettingsSidebar engine={engine} renderer={renderer} />*/}
        </div>
    </div>;
}