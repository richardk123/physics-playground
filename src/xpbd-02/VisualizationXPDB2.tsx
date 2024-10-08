import {P5Renderer} from "../components/P5Renderer";
import React from "react";
import {Engines} from "./engine/Engine";
import p5Types from "p5";
import {Renderers} from "./engine/Renderer";
import {ParticleFormations} from "./engine/entitity/ParticleFormation";
import {SettingsSidebar} from "./SettingsSidebar";
import {vec2} from "gl-matrix";
import {delay, fromEvent} from "rxjs";
import {drag$, shoot$} from "./engine/utils/CanvasUtils";
import {Colors} from "./engine/entitity/Color";
import {createScene1} from "./engine/scene/Scene1";

export const VisualizationXPDB2 = () =>
{
    const engine = Engines.create();
    const renderer = Renderers.create(engine);
    const bodies = new ParticleFormations(engine);

    renderer.lookAt(50, 50);
    renderer.setSimulationWidth(150);

    createScene1(engine, bodies);


    const registerShooting = (canvas: HTMLCanvasElement) =>
    {
        shoot$(canvas).subscribe(downUp =>
        {
            const direction = vec2.subtract(vec2.create(), downUp[0], downUp[1]);
            const angle = -Math.atan2(downUp[1][1] - downUp[0][1], downUp[1][0] - downUp[0][0]);
            const distance = vec2.len(direction);
            vec2.normalize(direction, direction);
            vec2.scale(direction, direction, distance);

            const position = renderer.transform().toSimulation(downUp[0][0], downUp[0][1]);
            const bullet = bodies.rectangle(position.x, position.y, 5, 5, 1, Colors.darkYellow())
                .withNeighbouringConstraints(0, 0.1);
            bullet.rotate(angle);

            // y must be inversed
            bullet.setVelocity(direction[0], -direction[1]);
        });

        drag$(canvas, 0)
            .subscribe((val) =>
            {
                renderer.addCustomRender({
                    render: (p5) =>
                    {
                        p5.strokeWeight(3)
                        p5.stroke(0, 0, 200);
                        p5.fill(0, 0, 200);
                        p5.line(val.position[0], val.position[1], val.endPosition[0], val.endPosition[1]);
                    },
                    name: "mouse-drag-arrow",
                });
            });

        fromEvent(canvas, 'mouseup')
            .pipe(delay(1000))
            .subscribe(() =>
            {
                renderer.removeCustomRenderer("mouse-drag-arrow");
            })
    }

    const setup = (p5: p5Types, canvas: HTMLCanvasElement) =>
    {
        renderer.render(p5);
        registerShooting(canvas);
    }

    const render = (p5: p5Types) =>
    {
        engine.simulate(1 / 60);
        renderer.render(p5);
    }

    return <div className="flex h-full bg-gray-200">
        <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 h-full w-full">
                <P5Renderer render={render} setup={setup}/>
            </main>
        </div>
        <div className="w-64 text-white">
            <SettingsSidebar engine={engine} />
        </div>
    </div>;

}