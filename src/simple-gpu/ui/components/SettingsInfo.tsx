import {Engine} from "../../engine/Engine";
import React, {useEffect, useState} from "react";
import {EngineSettings} from "../../engine/data/EngineSettings";
import {timer} from "rxjs";
import {Camera} from "../../engine/data/Camera";

export const SettingsInfo = ({engine}: {engine: Engine}) =>
{
    const [increment, setIncrement] = useState(0);
    const [settings, setSettings] = useState<EngineSettings>();
    const [particleCount, setParticleCount] = useState(0);
    const [camera, setCamera] = useState<Camera | undefined>();
    const [cpuPhysicsMsPerFrame, setCpuPhysicsMsPerFrame] = useState(0);
    const [cpuRenderMsPerFrame, setCpuRenderMsPerFrame] = useState(0);
    const [gpuRenderMsPerFrame, setGpuRenderMsPerFrame] = useState(0);

    useEffect(() =>
    {
        const sub = timer(100).subscribe(() =>
        {
            setSettings(engine.solver.settingsBuffer.settings);
            setParticleCount(engine.solver.particlesBuffer.particles.count);
            setCamera(engine.renderer.cameraBuffer.camera);
            setIncrement(increment + 1);
            setCpuPhysicsMsPerFrame(engine.solver.msPerFrame());
            setCpuRenderMsPerFrame(engine.renderer.cpuTime());
            setGpuRenderMsPerFrame(engine.renderer.gpuTime())
        });

        return () => sub.unsubscribe();
    }, [increment]);

    return <div className="w-full h-full">
        <p>Particle count: {particleCount}</p>
        <p>CPU Physics per frame: {cpuPhysicsMsPerFrame.toFixed(2)}ms</p>
        <p>CPU Render: {cpuRenderMsPerFrame.toFixed(2)}ms</p>
        <p>GPU Render: {(gpuRenderMsPerFrame / 1000).toFixed(2)}µs</p>
        <p>Grid size: {`[${settings?.gridSizeX}, ${settings?.gridSizeY}]`}</p>
        <p>Delta time: {settings?.deltaTime.toFixed(5)}</p>
        <p>Gravity {`[${settings?.gravity.x.toFixed(2)}, ${settings?.gravity.y.toFixed(2)}]`}</p>
        <p>Translation: {`[${camera?.translation.x.toFixed(2)}, ${camera?.translation.y.toFixed(2)}]`}</p>
        <p>Zoom: {camera?.zoom.toFixed(5)}</p>
    </div>
}