import { Card } from "@material-tailwind/react";
import { AccordionComponent } from "../common/AccordionComponent";
import React, { useEffect, useState } from "react";
import { TimeMeasurements } from "./TimeMeasurements";
import { SceneControls } from "./SceneControls";
import { Engine } from "../../engine/Engine";
import { createScenes } from "../../scene/Scenes";
import { ReadOnlySettings } from "./ReadOnlySettings";
import { registerMoving, registerScrolling } from "../utils/CanvasUtils";

export const EngineSettings = ({ canvas }: { canvas: HTMLCanvasElement }) => {
    const [engine, setEngine] = useState<Engine | undefined>(undefined);
    const scenes = createScenes(canvas);

    useEffect(() => {
        scenes[0].create()
            .then(async engine => {
                console.log("init first scene");
                setEngine(engine);
                await engine.startLoop();
            })
    }, [canvas]);

    useEffect(() => {
        if (engine) {
            console.log("subscribing scrolling and moving");

            const settings = engine.getSettings();
            const s1 = registerScrolling(canvas, settings);
            const s2 = registerMoving(canvas, settings);
            return () => {
                console.log("unsubscribing scrolling and moving");
                s1.unsubscribe();
                s2.unsubscribe();
            }
        }
    }, [canvas, engine])

    if (engine) {
        return <div className="w-full h-full bg-physics-surface/30 backdrop-blur-xl border-l border-white/5 p-4 text-slate-200 overflow-y-auto">
            <AccordionComponent expanded={true} label="Select scene">
                <SceneControls canvas={canvas} engine={engine} onChangeEngine={setEngine} />
            </AccordionComponent>
            <AccordionComponent expanded={true} label="Performance">
                <TimeMeasurements engine={engine} />
            </AccordionComponent>
            <AccordionComponent expanded={true} label="Performance">
                <ReadOnlySettings engine={engine} />
            </AccordionComponent>
        </div>
    }
    return <div className="w-full h-full bg-physics-surface/30 backdrop-blur-xl border-l border-white/5 p-4 text-slate-200 overflow-y-auto">
        Loading...
    </div>
}