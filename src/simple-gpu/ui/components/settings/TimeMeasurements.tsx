import {Engine} from "../../../engine/Engine";
import React, {useEffect, useState} from "react";
import {SolverTimeMeasurement} from "../../../engine/Solver";
import {timer} from "rxjs";

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
            setSolverMeasurement(engine.solver.timeMeasurement());
            setCpuRenderMsPerFrame(engine.renderer.cpuTime());
            setGpuRenderMsPerFrame(engine.renderer.gpuTime());
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
        return (solverMeasurement.preSolve +
            solverMeasurement.gridClear +
            solverMeasurement.gridUpdate +
            solverMeasurement.prefixSum +
            solverMeasurement.particleSort +
            solverMeasurement.boundingBox +
            solverMeasurement.collisionSolve +
            solverMeasurement.densityCompute +
            solverMeasurement.densitySolve +
            solverMeasurement.positionChangeApply +
            solverMeasurement.postSolve) / 1000;
    }

    return <div className="w-full h-full">
        <p>CPU Render: {cpuRenderMsPerFrame.toFixed(2)}ms</p>
        <p>GPU Render: {(gpuRenderMsPerFrame / 1000).toFixed(2)}µs</p>
        <br/>
        <p>CPU Physics per frame: {solverMeasurement?.cpuTime.toFixed(2)}ms</p>
        <p>GPU Physics per frame: {gpuPhysicsPerFrame().toFixed(2)}ms</p>
        <br/>
        <ul>
            <li>preSolve: {solverMeasurement?.preSolve.toFixed(2)}µs</li>
            <li>gridClear: {solverMeasurement?.gridClear.toFixed(2)}µs</li>
            <li>gridUpdate: {solverMeasurement?.gridUpdate.toFixed(2)}µs</li>
            <li>prefixSum: {solverMeasurement?.prefixSum.toFixed(2)}µs</li>
            <li>particleSort: {solverMeasurement?.particleSort.toFixed(2)}µs</li>
            <li>boundingBox: {solverMeasurement?.boundingBox.toFixed(2)}µs</li>
            <li>collisionSolve: {solverMeasurement?.collisionSolve.toFixed(2)}µs</li>
            <li>densityCompute: {solverMeasurement?.densityCompute.toFixed(2)}µs</li>
            <li>densitySolve: {solverMeasurement?.densitySolve.toFixed(2)}µs</li>
            <li>positionChangeApply: {solverMeasurement?.positionChangeApply.toFixed(2)}µs</li>
            <li>postSolve: {solverMeasurement?.postSolve.toFixed(2)}µs</li>
        </ul>
    </div>
}