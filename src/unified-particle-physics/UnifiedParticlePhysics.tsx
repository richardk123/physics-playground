import {Renderer} from "../components/Renderer";
import React from "react";
import p5Types from "p5";
import {Engine} from "./engine/Engine";
import {Renderers} from "./renderer/Renderer";
import {SettingsSidebar} from "./SettingsSidebar";

export const UnifiedParticlePhysics = () =>
{
    const engine = new Engine();
    engine.setWorldBoundingBox({x: 0, y: 10}, {x: 100, y: 80});

    const renderer = Renderers.create(engine);
    renderer.setLookAt(50, 50);
    renderer.setSimulationWidth(100);

    const setup = (p5: p5Types, canvas: HTMLCanvasElement) =>
    {
        renderer.render(p5);
    }

    const render = (p5: p5Types) =>
    {
        engine.simulate();
        renderer.render(p5);
    }

    return <div className="flex h-full bg-gray-200">
        <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 h-full w-full">
                <Renderer render={render} setup={setup}/>
            </main>
        </div>
        <div className="w-64 text-white">
            <SettingsSidebar engine={engine} renderer={renderer} />
        </div>
    </div>;

}