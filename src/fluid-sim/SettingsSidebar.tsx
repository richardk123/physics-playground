import {Card} from "@material-tailwind/react";
import React, {useEffect, useState} from "react";
import {Engine} from "./engine/Engine";
import {timer} from "rxjs";

interface Props
{
    engine: Engine;
}
export const SettingsSidebar = (props: Props) =>
{
    const [increment, setIncrement] = useState(0);
    const [duration, setDuration] = useState(0);
    const [particleCount, setParticleCount] = useState(0);
    const [averageDensity, setAverageDensity] = useState(0);

    useEffect(() =>
    {
        const sub = timer(100).subscribe(() =>
        {
            setDuration(Math.floor(props.engine.info().duration * 10) / 10);
            setParticleCount(props.engine.info().pointsCount);
            setAverageDensity(props.engine.info().averageDensity)
            setIncrement(increment + 1);
        });

        return () => sub.unsubscribe();
    }, [increment]);


    const reload = () =>
    {
        window.location.reload();
    }

    return <Card className="w-96 h-full">
        <button onClick={reload}>Reload</button>
        <p>Physics ms per frame: {duration}</p>
        <p>Particle count: {particleCount}</p>
        <p>Average density: {Math.floor(averageDensity * 1000) / 1000}</p>
    </Card>
}