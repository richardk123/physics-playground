import React, {useEffect, useState} from "react";
import {timer} from "rxjs";
import {BoxTitle} from "../common/BoxTitle";
import {CheckboxComponent} from "../common/CheckboxComponent";
import {SolverTimeMeasurement} from "../../engine/Solver";
import {Engine} from "../../engine/Engine";

export const TimeMeasurements = ({engine}: {engine: Engine}) =>
{
    const [increment, setIncrement] = useState(0);

    const [solverMeasurement, setSolverMeasurement] = useState<SolverTimeMeasurement | undefined>(undefined);
    const [cpuRenderMsPerFrame, setCpuRenderMsPerFrame] = useState(0);
    const [gpuRenderMsPerFrame, setGpuRenderMsPerFrame] = useState(0);

    useEffect(() =>
    {
        const sub = timer(1000).subscribe(() =>
        {
            setSolverMeasurement(engine.timeMeasurement());
            // setCpuRenderMsPerFrame(engine.renderer.cpuTime());
            // setGpuRenderMsPerFrame(engine.renderer.gpuTime());
            setIncrement(increment + 1);
        });

        return () => sub.unsubscribe();
    }, [increment]);

    const gpuPhysicsPerFrame = () =>
    {
        if (!solverMeasurement)
        {
            return 0;
        }
        // TODO:
        return 0;
    }

    return <div className="w-full h-full">
        <BoxTitle label="Measurements enabled">
            {/*<CheckboxComponent value={settings.performance}*/}
            {/*                   setValue={e => settings.performance = e} />*/}
        </BoxTitle>
        <p>CPU Render: {cpuRenderMsPerFrame.toFixed(2)}ms</p>
        <p>GPU Render: {(gpuRenderMsPerFrame / 1000).toFixed(2)}µs</p>
        <br/>
        <p>CPU Physics per frame: {solverMeasurement?.cpuTime.toFixed(2)}ms</p>
        <p>GPU Physics per frame: {gpuPhysicsPerFrame().toFixed(2)}ms</p>
        <br/>
        <ul>
            <li>todo:</li>
        </ul>
    </div>
}