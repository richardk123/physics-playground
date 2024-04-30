import {Card} from "@material-tailwind/react";
import {AccordionComponent} from "../common/AccordionComponent";
import {ReadOnlySettings} from "./ReadOnlySettings";
import React, {useEffect, useState} from "react";
import {TimeMeasurements} from "./TimeMeasurements";
import {SceneControls} from "./SceneControls";
import {Engine} from "../../../engine/Engine";
import {EditableSettings} from "./EditableSettings";
import {registerMoving, registerScrolling} from "../utils/CanvasUtils";
import {MaterialControls} from "./MaterialControls";
import {createSimpleScene} from "../scene/SimpleScene";

export const EngineSettings = ({canvas}: {canvas: HTMLCanvasElement}) =>
{
    const [engine, setEngine] = useState<Engine | undefined>(undefined);

    useEffect(() =>
    {
        createSimpleScene(canvas)
            .then(async engine =>
            {
                console.log("init first scene");
                setEngine(engine);
                await engine.startLoop();
            })
    },[canvas]);

    useEffect(() =>
    {
        if (engine)
        {
            console.log("subscribing scrolling and moving");

            const camera = engine.renderer.cameraBuffer.camera;
            const s1 = registerScrolling(canvas, camera);
            const s2 = registerMoving(canvas, camera);
            return () =>
            {
                console.log("unsubscribing scrolling and moving");
                s1.unsubscribe();
                s2.unsubscribe();
            }
        }
    }, [canvas, engine])

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
            <AccordionComponent expanded={false} label="Materials">
                <MaterialControls engine={engine}/>
            </AccordionComponent>
        </Card>
    }
    return <Card className="w-full h-full">
        Loading...
    </Card>
}