import React, {useEffect, useState} from "react";
import {timer} from "rxjs";
import {Card} from "@material-tailwind/react";
import {VectorComponent} from "./components/VectorComponent";
import {SliderComponent} from "./components/SliderComponent";
import {AccordionComponent} from "./components/AccordionComponent";
import {Engine} from "../engine/Engine";
import {BoxTitle} from "./components/BoxTitle";
import {Camera} from "../engine/data/Camera";

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
    const camera: Camera = engine.getCamera();

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
                <VectorComponent vector={{x: bb.getCorners().bottomLeft.x, y: bb.getCorners().bottomLeft.y}}
                                 change={(v) =>
                                 {
                                     bb.update(v, bb.getCorners().topRight)
                                 }}/>
                <VectorComponent vector={{x: bb.getCorners().topRight.x, y: bb.getCorners().topRight.y}}
                                 change={(v) =>
                                 {
                                     bb.update(bb.getCorners().bottomLeft, v);
                                 }}/>
            </BoxTitle>
        </AccordionComponent>
        <AccordionComponent expanded={true} label="Camera">
            <BoxTitle label="Scale">
                <VectorComponent vector={{x: camera.getScale().x, y: camera.getScale().y}}
                                 change={(v) => camera.setScale(v)}/>
            </BoxTitle>
            <BoxTitle label="Translation">
                <VectorComponent vector={{x: camera.getTranslation().x, y: camera.getTranslation().y}}
                                 change={(v) => camera.setTranslation(v)}/>
            </BoxTitle>
            <BoxTitle label="Rotation">
                <SliderComponent value={camera.getRotation()}
                                 setValue={val => camera.setRotation(val)}
                                 minVal={-Math.PI}
                                 maxVal={Math.PI} />
            </BoxTitle>
        </AccordionComponent>
    </Card>
}