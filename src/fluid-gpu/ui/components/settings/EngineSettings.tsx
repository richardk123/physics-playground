import { Card } from "@material-tailwind/react";
import { AccordionComponent } from "../common/AccordionComponent";
import { ReadOnlySettings } from "./ReadOnlySettings";
import React, { useEffect, useState } from "react";
import { TimeMeasurements } from "./TimeMeasurements";
import { SceneControls } from "./SceneControls";
import { Engine } from "../../../engine/Engine";
import { EditableSettings } from "./EditableSettings";
import { registerMoving, registerScrolling } from "../utils/CanvasUtils";
import { MaterialControls } from "./MaterialControls";
import { createScenes } from "../scene/Scenes";

export const EngineSettings = ({ canvas }: { canvas: HTMLCanvasElement }) => {
    const [engine, setEngine] = useState<Engine | undefined>(undefined);
    const scenes = createScenes(canvas);

    useEffect(() => {
        let activeEngine: Engine | undefined;
        let isMounted = true;

        scenes[0].create()
            .then(async engine => {
                if (!isMounted) {
                    console.log("Engine created after unmount, destroying...");
                    engine.destroy();
                    return;
                }
                console.log("init first scene");
                activeEngine = engine;
                setEngine(engine);
                await engine.startLoop();
            })

        return () => {
            isMounted = false;
            if (activeEngine) {
                console.log("Unmounting EngineSettings, destroying engine...");
                activeEngine.destroy();
            }
        }
    }, [canvas]);

    useEffect(() => {
        if (engine) {
            console.log("subscribing scrolling and moving");

            const camera = engine.renderer.cameraBuffer.camera;
            const s1 = registerScrolling(canvas, camera);
            const s2 = registerMoving(canvas, camera);
            return () => {
                console.log("unsubscribing scrolling and moving");
                s1.unsubscribe();
                s2.unsubscribe();
            }
        }
    }, [canvas, engine])

    if (engine) {
        return <div className="w-full h-full bg-physics-surface/30 backdrop-blur-xl border-l border-white/5 p-4 text-slate-200 overflow-y-auto custom-scrollbar flex flex-col">
            <AccordionComponent expanded={true} label="Select scene">
                <SceneControls canvas={canvas} engine={engine} onChangeEngine={setEngine} />
            </AccordionComponent>
            <AccordionComponent expanded={false} label="Settings">
                <ReadOnlySettings engine={engine} />
            </AccordionComponent>
            <AccordionComponent expanded={false} label="Performance">
                <TimeMeasurements engine={engine} />
            </AccordionComponent>
            <AccordionComponent expanded={false} label="Simulation settings">
                <EditableSettings engine={engine} />
            </AccordionComponent>
            <AccordionComponent expanded={false} label="Materials">
                <MaterialControls engine={engine} />
            </AccordionComponent>
        </div>
    }
    return <div className="w-full h-full bg-physics-surface/30 backdrop-blur-xl border-l border-white/5 p-4 text-slate-200 overflow-y-auto custom-scrollbar flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
            <svg className="animate-spin h-8 w-8 text-physics-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-medium animate-pulse">Initializing GPU...</span>
        </div>
    </div>
}