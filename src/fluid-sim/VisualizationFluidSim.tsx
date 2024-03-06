import {Renderer} from "../components/Renderer";
import React from "react";
import {Engines} from "./engine/Engine";
import p5Types from "p5";
import {Renderers} from "./engine/Renderer";
import {ParticleFormations} from "./engine/entitity/ParticleFormation";
import {SettingsSidebar} from "./SettingsSidebar";
import {createScene1} from "./engine/scene/Scene1";
import {createScene2} from "./engine/scene/Scene2";
import {mouseMove$} from "./engine/utils/CanvasUtils";
import {Colors} from "./engine/entitity/Color";

export const VisualizationFluidSim = () =>
{
    const engine = Engines.create();
    const renderer = Renderers.create(engine);
    const bodies = new ParticleFormations(engine);

    renderer.lookAt(50, 50);
    renderer.setSimulationWidth(100);

    // createScene1(engine, bodies);
    bodies.rectangle(
        20,
        20,
        35,
        35,
        1,
        Colors.blue());

    const collisionCircle = bodies.collisionCircle(1000, 1000, 10);

    const setup = (p5: p5Types, canvas: HTMLCanvasElement) =>
    {
        renderer.render(p5);
        mouseMove$(canvas).subscribe(position =>
        {
            const simPos = renderer.transform().toSimulation(position[0], position[1]);
            collisionCircle.setPosition(simPos.x, simPos.y);
        })
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
            <SettingsSidebar engine={engine} />
        </div>
    </div>;

}