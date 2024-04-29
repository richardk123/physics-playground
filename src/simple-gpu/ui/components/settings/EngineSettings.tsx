import {Card} from "@material-tailwind/react";
import {AccordionComponent} from "../common/AccordionComponent";
import {ReadOnlySettings} from "./ReadOnlySettings";
import React, {useEffect, useState} from "react";
import {TimeMeasurements} from "./TimeMeasurements";
import {SceneControls} from "./SceneControls";
import {Engine} from "../../../engine/Engine";
import {createScene1} from "../scene/Scene1";
import {EditableSettings} from "./EditableSettings";

export const EngineSettings = ({canvas}: {canvas: HTMLCanvasElement}) =>
{
    const [engine, setEngine] = useState<Engine | undefined>(undefined);

    useEffect(() =>
    {
        createScene1(canvas)
            .then(async engine =>
            {
                console.log("init first scene");
                setEngine(engine);
                engine.running = true;
                await engine.simulateLoop();
                await engine.renderLoop();
            })
    },[canvas]);

    if (engine)
    {
        return <Card className="w-full h-full">
            <AccordionComponent expanded={true} label="Select scene">
                <SceneControls canvas={canvas} engine={engine} onChangeEngine={setEngine}/>
            </AccordionComponent>
            <AccordionComponent expanded={false} label="Settings">
                <ReadOnlySettings engine={engine} />
            </AccordionComponent>
            <AccordionComponent expanded={false} label="Performance">
                <TimeMeasurements engine={engine} />
            </AccordionComponent>
            <AccordionComponent expanded={false} label="Simulation settings">
                <EditableSettings engine={engine}/>
            </AccordionComponent>
        </Card>
    }
    return <Card className="w-full h-full">
        Loading...
    </Card>
}