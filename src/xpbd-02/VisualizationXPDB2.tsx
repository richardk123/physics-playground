import {Renderer} from "../components/Renderer";
import React from "react";
import {Engines} from "./engine/Engine";
import p5Types from "p5";
import {Renderers} from "./engine/Renderer";
import {Bodies} from "./engine/Body";

export const VisualizationXPDB2 = () =>
{
    const engine = Engines.create();
    const renderer = Renderers.create(engine);
    const bodies = new Bodies(engine);

    renderer.lookAt(50, 50);
    renderer.setSimulationWidth(120);

    bodies.rectangle(10, 10, 80, 80, 0, 0.5);

    const setup = (p5: p5Types, canvas: HTMLCanvasElement) =>
    {
        renderer.render(p5);
    }

    const render = (p5: p5Types) =>
    {
        engine.simulate(1 / 60);
        renderer.render(p5);
    }

    return <div className="flex h-full bg-gray-200">
        <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 h-full w-full">
                <Renderer render={render} setup={setup}/>
            </main>
        </div>
        <div className="w-64 text-white">
            {/*<SettingsSidebar engine={engine} renderer={renderer} />*/}
        </div>
    </div>;

}