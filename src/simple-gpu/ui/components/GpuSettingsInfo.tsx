import {Engine} from "../../engine/Engine";
import React, {useEffect, useState} from "react";
import {SettingsGpuData} from "../../engine/data/EngineSettings";
import {timer} from "rxjs";
import {Card} from "@material-tailwind/react";

interface Props
{
    engine?: Engine;
}

export const GpuSettingsInfo = (props: Props) =>
{
    const [increment, setIncrement] = useState(0);
    const [gpuSettings, setGpuSettings] = useState<SettingsGpuData | undefined>();

    useEffect(() =>
    {
        const sub = timer(100).subscribe(async () =>
        {
            const gpuSettings = await props.engine?.solver.settingsBuffer.read();
            setGpuSettings(gpuSettings);
            setIncrement(increment + 1);
        });

        return () => sub.unsubscribe();
    }, [increment]);

    return <Card className="w-96 h-full">
        <p>Particle count: {gpuSettings?.particleCount}</p>
        <p>Grid size x: {gpuSettings?.gridSizeX}</p>
        <p>Grid size y: {gpuSettings?.gridSizeY}</p>
    </Card>
}