import React, {useEffect, useState} from "react";
import {timer} from "rxjs";
import {Card} from "@material-tailwind/react";
import {VectorComponent} from "./components/VectorComponent";
import {SliderComponent} from "./components/SliderComponent";
import {AccordionComponent} from "./components/AccordionComponent";
import {Engine} from "../engine/Engine";
import {BoxTitle} from "./components/BoxTitle";
import {Camera} from "../engine/data/Camera";
import {Typography} from "@mui/material";

interface Props
{
    engine: Engine;
}
export const SettingsSidebar = (props: Props) =>
{
    const [increment, setIncrement] = useState(0);
    const [simulationDuration, setSimulationDuration] = useState("0");
    const [pointCount, setPointCount] = useState(0);

    useEffect(() =>
    {
        const sub = timer(100).subscribe(() =>
        {
            setSimulationDuration(props.engine.solver.simulationDuration.toFixed(2));
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
            <BoxTitle label="Zoom">
                <SliderComponent value={camera.zoom}
                                 setValue={val => camera.zoom = val}
                                 minVal={0.001248439450687}
                                 maxVal={1.2} />
                <Typography variant="caption">
                    Simulation w: {engine.getSimulationSize().x.toFixed(2)}
                    h: {engine.getSimulationSize().y.toFixed(2)}
                </Typography>
            </BoxTitle>
            <BoxTitle label="Translation">
                <VectorComponent vector={{x: camera.translation.x, y: camera.translation.y}}
                                 change={(v) => camera.translation = v}/>
            </BoxTitle>
            <BoxTitle label="Rotation">
                <SliderComponent value={camera.rotation}
                                 setValue={val => camera.rotation = val}
                                 minVal={-Math.PI * 2}
                                 maxVal={Math.PI * 2} />
            </BoxTitle>
        </AccordionComponent>
    </Card>
}