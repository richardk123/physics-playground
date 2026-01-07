import React, { useEffect, useState } from "react";
import { EngineSettings } from "./settings/EngineSettings";

export const NBodyGPU = () => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [canvasLoaded, setCanvasLoaded] = useState(false);

    useEffect(() => {
        setCanvasLoaded(canvasRef.current !== null);
    }, []);

    return (
        <div className="flex h-full w-full">
            <div className="flex-1 flex flex-col h-full">
                <div className="flex h-full">
                    <canvas id="nbody-canvas" className="w-full h-full" ref={canvasRef}></canvas>
                </div>
            </div>
            <div className="w-76 h-full text-white">
                {canvasLoaded && <EngineSettings canvas={canvasRef.current!} />}
            </div>
        </div>
    );
}