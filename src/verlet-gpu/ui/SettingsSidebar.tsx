import React, {useEffect, useState} from "react";
import {timer} from "rxjs";
import {Card} from "@material-tailwind/react";
import {VectorComponent} from "./components/VectorComponent";
import {SliderComponent} from "./components/SliderComponent";
import {AccordionComponent} from "./components/AccordionComponent";
import {Engine} from "../engine/Engine";
import {BoxTitle} from "./components/BoxTitle";

interface Props
{
    engine: Engine;
}
export const SettingsSidebar = (props: Props) =>
{
    const [increment, setIncrement] = useState(0);
    const [simulationDuration, setSimulationDuration] = useState(0);
    const [pointCount, setPointCount] = useState(0);

    useEffect(() =>
    {
        const sub = timer(100).subscribe(() =>
        {
            const DIGITS = 100;
            setSimulationDuration(Math.floor(props.engine.solver.simulationDuration * DIGITS) / DIGITS);
            setPointCount(props.engine.solver.points.count);
            setIncrement(increment + 1);
        });

        return () => sub.unsubscribe();
    }, [increment]);

    const engine = props.engine;
    const bb = engine.getWorldBoundingBox();
    const simSettings = engine.getSettings();

    return <Card className="w-96 h-full">
        <p>Physics ms per frame: {simulationDuration}</p>
        <p>Point count: {pointCount}</p>
        <AccordionComponent expanded={true} label="Simulation settings">
            <BoxTitle label="Simulations per second">
                <SliderComponent value={1 / simSettings.deltaTime}
                                 setValue={val => engine.setSettings({...simSettings, deltaTime: 1 / val})}
                                 step={1}
                                 minVal={30}
                                 maxVal={120} />
            </BoxTitle>
            <BoxTitle label="Point diameter">
                <SliderComponent value={simSettings.pointDiameter}
                                 setValue={val => engine.setSettings({...simSettings, pointDiameter: val})}
                                 minVal={0.1}
                                 maxVal={10} />
            </BoxTitle>
            <BoxTitle label="Sub-step count">
                <SliderComponent value={simSettings.subStepCount}
                                 setValue={val => engine.setSettings({...simSettings, subStepCount: val})}
                                 step={1}
                                 minVal={0}
                                 maxVal={20} />
            </BoxTitle>
            <BoxTitle label="Gravity">
                <SliderComponent value={simSettings.gravity.x}
                                 setValue={val => engine.setSettings({...simSettings, gravity: {x: val, y: simSettings.gravity.y}})}
                                 minVal={-20}
                                 maxVal={20} />
                <SliderComponent value={simSettings.gravity.y}
                                 setValue={val => engine.setSettings({...simSettings, gravity: {x: simSettings.gravity.x, y: val}})}
                                 minVal={-20}
                                 maxVal={20} />
            </BoxTitle>
            <BoxTitle label="Bounding box">
                <VectorComponent vector={{x: bb.bottomLeft.x, y: bb.bottomLeft.y}}
                                 change={(v) =>
                                 {
                                     props.engine.updateWorldBoundingBox(v, bb.topRight)
                                 }}/>
                <VectorComponent vector={{x: bb.topRight.x, y: bb.topRight.y}}
                                 change={(v) =>
                                 {
                                     props.engine.updateWorldBoundingBox(bb.bottomLeft, v);
                                 }}/>
            </BoxTitle>
        </AccordionComponent>
    </Card>
}