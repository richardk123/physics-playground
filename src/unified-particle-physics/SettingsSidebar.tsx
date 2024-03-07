import React, {useEffect, useState} from "react";
import {timer} from "rxjs";
import {Engine} from "./engine/Engine";
import {Button} from "@mui/material";
import {Card} from "@material-tailwind/react";
import {VectorComponent} from "./components/VectorComponent";
import {EngineRenderer} from "./renderer/Renderer";
import {SliderComponent} from "./components/SliderComponent";
import {AccordionComponent} from "./components/AccordionComponent";

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
            setSimulationDuration(Math.floor(props.engine.simulationDuration * DIGITS) / DIGITS);
            setIncrement(increment + 1);
        });

        return () => sub.unsubscribe();
    }, [increment]);

    const bb = props.engine.getWorldBoundingBox();

    return <Card className="w-96 h-full">
        <p>Physics ms per frame: {simulationDuration}</p>
        <AccordionComponent label="Look at">
            <VectorComponent vector={props.renderer.getLookAt()}
                             change={(v) => props.renderer.setLookAt(v.x, v.y)}/>
        </AccordionComponent>
        <AccordionComponent label="Zoom">
            <SliderComponent value={props.renderer.getSimulationWidth()}
                             setValue={props.renderer.setSimulationWidth}
                             minVal={1}
                             maxVal={500} />
        </AccordionComponent>
        <AccordionComponent label="Bounding box">
            <VectorComponent vector={{x: bb.minX, y: bb.minY}}
                             change={(v) => props.engine.setWorldBoundingBox(v, {x: bb.maxX, y: bb.maxY})}/>
            <VectorComponent vector={{x: bb.maxX, y: bb.maxY}}
                             change={(v) => props.engine.setWorldBoundingBox({x: bb.minX, y: bb.minY}, v)}/>
        </AccordionComponent>
    </Card>
}