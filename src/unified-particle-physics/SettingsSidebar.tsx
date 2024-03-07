import React, {useEffect, useState} from "react";
import {timer} from "rxjs";
import {Solver} from "./engine/solver/Solver";
import {Card} from "@material-tailwind/react";
import {VectorComponent} from "./components/VectorComponent";
import {EngineRenderer} from "./renderer/Renderer";
import {SliderComponent} from "./components/SliderComponent";
import {AccordionComponent} from "./components/AccordionComponent";
import {BoundingBoxes} from "./engine/data/BoundingBox";
import {Engine} from "./engine/Engine";
import {BoxTitle} from "./components/BoxTitle";

interface Props
{
    engine: Engine;
    renderer: EngineRenderer;
}
export const SettingsSidebar = (props: Props) =>
{
    const [increment, setIncrement] = useState(0);
    const [simulationDuration, setSimulationDuration] = useState(0);

    useEffect(() =>
    {
        const sub = timer(100).subscribe(() =>
        {
            const DIGITS = 100;
            setSimulationDuration(Math.floor(props.engine.solver.simulationDuration * DIGITS) / DIGITS);
            setIncrement(increment + 1);
        });

        return () => sub.unsubscribe();
    }, [increment]);

    const engine = props.engine;
    const bb = engine.getWorldBoundingBox();
    const simSettings = engine.getSettings();

    return <Card className="w-96 h-full">
        <p>Physics ms per frame: {simulationDuration}</p>
        <AccordionComponent expanded={true} label="Simulation settings">
            <BoxTitle label="Delta time">
                <SliderComponent value={simSettings.deltaTime}
                                 setValue={val => engine.setSettings({...simSettings, deltaTime: val})}
                                 minVal={1 / 120}
                                 maxVal={1 / 10} />
            </BoxTitle>
            <BoxTitle label="Friction">
                <SliderComponent value={simSettings.friction}
                                 setValue={val => engine.setSettings({...simSettings, friction: val})}
                                 minVal={0}
                                 maxVal={1} />
            </BoxTitle>
            <BoxTitle label="Point diameter">
                <SliderComponent value={simSettings.pointDiameter}
                                 setValue={val => engine.setSettings({...simSettings, pointDiameter: val})}
                                 minVal={1 / 120}
                                 maxVal={1 / 10} />
            </BoxTitle>
            <BoxTitle label="Sub-step count">
                <SliderComponent value={simSettings.subStepCount}
                                 setValue={val => engine.setSettings({...simSettings, subStepCount: val})}
                                 step={1}
                                 minVal={0}
                                 maxVal={20} />
            </BoxTitle>
            <BoxTitle label="Gravity">
                <VectorComponent vector={simSettings.gravity}
                                 change={(v) => engine.setSettings({...simSettings, gravity: v})}/>
            </BoxTitle>
            <BoxTitle label="Look at">
                <VectorComponent vector={props.renderer.getLookAt()}
                                 change={(v) => props.renderer.setLookAt(v.x, v.y)}/>
            </BoxTitle>
            <BoxTitle label="Zoom">
                <SliderComponent value={props.renderer.getSimulationWidth()}
                                 setValue={props.renderer.setSimulationWidth}
                                 minVal={1}
                                 maxVal={500} />
            </BoxTitle>
            <BoxTitle label="Bounding box">
                <VectorComponent vector={{x: bb.bottomLeft.x, y: bb.bottomLeft.y}}
                                 change={(v) =>
                                 {
                                     const result = BoundingBoxes.createFromVec(v, bb.topRight);
                                     props.engine.setWorldBoundingBox(result)
                                 }}/>
                <VectorComponent vector={{x: bb.topRight.x, y: bb.topRight.y}}
                                 change={(v) =>
                                 {
                                     const result = BoundingBoxes.createFromVec(bb.bottomLeft, v);
                                     props.engine.setWorldBoundingBox(result);
                                 }}/>
            </BoxTitle>
        </AccordionComponent>
    </Card>
}