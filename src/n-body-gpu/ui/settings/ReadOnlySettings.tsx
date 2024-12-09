import React, {useEffect, useState} from "react";
import {timer} from "rxjs";
import {Engine} from "../../engine/Engine";
import {EngineSettings} from "../../engine/data/EngineSettings";

export const ReadOnlySettings = ({engine}: {engine: Engine}) =>
{
    const [increment, setIncrement] = useState(0);
    const [particleCount, setParticleCount] = useState(0);
    const [settings, setSettings] = useState<EngineSettings | undefined>();

    useEffect(() =>
    {
        const sub = timer(100).subscribe(() =>
        {
            setParticleCount(engine.getParticleCount());
            setSettings(engine.getSettings());
            setIncrement(increment + 1);
        });

        return () => sub.unsubscribe();
    }, [increment]);

    return <div className="w-full h-full">
        <p>Particle count: {particleCount}</p>
        <p>Translation: {`[${settings?.cameraX.toFixed(2)}, ${settings?.cameraY.toFixed(2)}]`}</p>
        <p>Zoom: {settings?.zoom.toFixed(5)}</p>
    </div>
}