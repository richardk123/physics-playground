import {Engine} from "../../engine/Engine";
import React, {useEffect, useState} from "react";
import {SettingsGpuData} from "../../engine/data/EngineSettings";
import {timer} from "rxjs";
import {Card} from "@material-tailwind/react";
import {Camera} from "../../engine/data/Camera";

interface Props
{
    engine?: Engine;
}

export const GpuSettingsInfo = (props: Props) =>
{
    const [increment, setIncrement] = useState(0);
    const [gpuSettings, setGpuSettings] = useState<SettingsGpuData | undefined>();
    const [camera, setCamera] = useState<Camera | undefined>();

    useEffect(() =>
    {
        const sub = timer(100).subscribe(() =>
        {
            const gpuSettings = props.engine?.solver.settingsBuffer.gpuData;
            setGpuSettings(gpuSettings);
            setCamera(props.engine?.renderer.cameraBuffer.camera);
            setIncrement(increment + 1);
        });

        return () => sub.unsubscribe();
    }, [increment]);

    return <Card className="w-96 h-full">
        <p>Particle count: {gpuSettings?.particleCount}</p>
        <p>Grid size x: {gpuSettings?.gridSizeX}</p>
        <p>Grid size y: {gpuSettings?.gridSizeY}</p>
        <p>Delta time: {gpuSettings?.deltaTime.toFixed(5)}</p>
        <p>Translation x: {camera?.translation.x.toFixed(2)}</p>
        <p>Translation y: {camera?.translation.y.toFixed(2)}</p>
        <p>Zoom: {camera?.zoom.toFixed(5)}</p>
    </Card>
}