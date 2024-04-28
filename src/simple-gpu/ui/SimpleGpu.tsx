import React, {useEffect, useState} from "react";
import {Sidebar} from "./components/Sidebar";
import {SceneControls} from "./components/scene/SceneControls";
import {createScene1} from "./components/scene/Scene1";

export const SimpleGpu = () =>
{
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [canvas, setCanvas] = useState<HTMLCanvasElement>();

    useEffect( () =>
    {
        const c = canvasRef.current!;
        setCanvas(c);
        createScene1(c)
            .then(async engine =>
            {
                engine.running = true;
                await engine.simulateLoop();
                await engine.renderLoop();
            });
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

    return (
        <div className="flex h-full bg-gray-200">
            <div className="flex-1 flex flex-col h-full">
                {canvas && <SceneControls canvas={canvas} />}
                <div className="flex h-full">
                    <canvas className="w-full h-full" ref={canvasRef} width={1980} height={1080}></canvas>
                </div>
            </div>
            <div className="w-64 h-full text-white">
                <Sidebar/>
            </div>
        </div>
    );
}