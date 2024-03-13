import {P5Renderer} from "../../components/P5Renderer";
import React from "react";
import p5Types from "p5";
import {Renderer} from "../renderer/Renderer";
import {SettingsSidebar} from "./SettingsSidebar";
import {BoundingBoxes} from "../engine/data/BoundingBox";
import {Engine} from "../engine/Engine";
import {Colors} from "../../fluid-sim/engine/entitity/Color";

export const UnifiedParticlePhysics = () =>
{
    const engine = Engine.create();
    engine.setWorldBoundingBox(BoundingBoxes.create(10, 10, 60, 80));

    const renderer = Renderer.create(engine);
    renderer.setLookAt(50, 50);
    renderer.setSimulationWidth(100);

    engine.createRectangle(
        20,
        20,
        25,
        25,
        1,
        Colors.blue());

    engine.createRectangle(
        40,
        20,
        25,
        25,
        1,
        Colors.red());

    // engine.createRectangle(
    //     20,
    //     20,
    //     1,
    //     2,
    //     1,
    //     Colors.blue());

    engine.simulate();

    const setup = (p5: p5Types, canvas: HTMLCanvasElement) =>
    {
        renderer.render(p5);
    }

    const render = (p5: p5Types) =>
    {
        renderer.render(p5);
    }

    return <div className="flex h-full bg-gray-200">
        <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 h-full w-full">
                <P5Renderer render={render} setup={setup}/>
            </main>
        </div>
        <div className="w-64 text-white">
            <SettingsSidebar engine={engine} renderer={renderer} />
        </div>
    </div>;

}