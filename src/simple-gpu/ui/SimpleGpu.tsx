import React, {useEffect, useState} from "react";
import {EngineSettings} from "./components/settings/EngineSettings";

export const SimpleGpu = () =>
{
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [canvasLoaded, setCanvasLoaded] = useState(false);

    useEffect( () =>
    {
        setCanvasLoaded(canvasRef.current !== null);
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
                <div className="flex h-full">
                    <canvas id="simple-gpu-canvas" className="w-full h-full" ref={canvasRef} width={1980} height={1080}></canvas>
                </div>
            </div>
            <div className="w-64 h-full text-white">
                {canvasLoaded && <EngineSettings canvas={canvasRef.current!} />}
            </div>
        </div>
    );
}