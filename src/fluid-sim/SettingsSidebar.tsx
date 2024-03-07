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
    const [simulationDuration, setSimulationDuration] = useState(0);
    const [preSolveDuration, setPreSolveDuration] = useState(0);
    const [solveDuration, setSolveDuration] = useState(0);
    const [postSolveDuration, setPostSolveDuration] = useState(0);
    const [particleCount, setParticleCount] = useState(0);
    const [averageDensity, setAverageDensity] = useState(0);

    useEffect(() =>
    {
        const sub = timer(100).subscribe(() =>
        {
            const DIGITS = 100;
            setSimulationDuration(Math.floor(props.engine.info().simulationDuration * DIGITS) / DIGITS);
            setPreSolveDuration(Math.floor(props.engine.info().preSolveDuration * DIGITS) / DIGITS);
            setSolveDuration(Math.floor(props.engine.info().solveDuration * DIGITS) / DIGITS);
            setPostSolveDuration(Math.floor(props.engine.info().postSolveDuration * DIGITS) / DIGITS);

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
        <p>Physics ms per frame: {simulationDuration}</p>
        <p>PreSolve ms: {preSolveDuration}</p>
        <p>Solve ms: {solveDuration}</p>
        <p>PostSolve ms: {postSolveDuration}</p>
        <p>Particle count: {particleCount}</p>
        <p>Average density: {Math.floor(averageDensity * 1000) / 1000}</p>
    </Card>
}