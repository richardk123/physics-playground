import {Card} from "@material-tailwind/react";
import {AccordionComponent} from "../common/AccordionComponent";
import React, {useEffect, useState} from "react";
import {TimeMeasurements} from "./TimeMeasurements";
import {SceneControls} from "./SceneControls";
import {Engine} from "../../engine/Engine";
import {createScenes} from "../../scene/Scenes";

export const EngineSettings = ({canvas}: {canvas: HTMLCanvasElement}) =>
{
    const [engine, setEngine] = useState<Engine | undefined>(undefined);
    const scenes = createScenes(canvas);

    useEffect(() =>
    {
        scenes[0].create()
            .then(async engine =>
            {
                console.log("init first scene");
                setEngine(engine);
                await engine.startLoop();
            })
    },[canvas]);

    if (engine)
    {
        return <Card className="w-full h-full">
            <AccordionComponent expanded={true} label="Select scene">
                <SceneControls canvas={canvas} engine={engine} onChangeEngine={setEngine}/>
            </AccordionComponent>
            <AccordionComponent expanded={false} label="Performance">
                <TimeMeasurements engine={engine} />
            </AccordionComponent>
        </Card>
    }
    return <Card className="w-full h-full">
        Loading...
    </Card>
}