import React, {useEffect, useState} from "react";
import {timer} from "rxjs";
import {Camera} from "../../engine/data/Camera";
import {Engine} from "../../engine/Engine";

export const ReadOnlySettings = ({engine}: {engine: Engine}) =>
{
    const [increment, setIncrement] = useState(0);
    const [particleCount, setParticleCount] = useState(0);
    const [camera, setCamera] = useState<Camera | undefined>();

    useEffect(() =>
    {
        const sub = timer(100).subscribe(() =>
        {
            setParticleCount(engine.getParticleCount());
            setCamera(engine.getCamera());
            setIncrement(increment + 1);
        });

        return () => sub.unsubscribe();
    }, [increment]);

    return <div className="w-full h-full">
        <p>Particle count: {particleCount}</p>
        <p>Translation: {`[${camera?.x.toFixed(2)}, ${camera?.y.toFixed(2)}]`}</p>
        <p>Zoom: {camera?.zoom.toFixed(5)}</p>
    </div>
}