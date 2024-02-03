import {Renderer} from "../components/Renderer";
import p5Types from "p5";
import {createEngine} from "./engine/Engine";
import {createRenderer, EngineRenderer} from "./renderer/Renderer";
import {Shape, Shapes} from "./engine/Shape";
import {drag$, mouseDown$, shoot$, Transform} from "./renderer/CanvasUtils";
import {vec2} from "gl-matrix";
import {delay, fromEvent, timer} from "rxjs";
import React, {useEffect, useState} from "react";
import {SettingsSidebar} from "./SettingsSidebar";
import {Points} from "./engine/PointMass";

export const VisualizationXPDB = () =>
{
    const engine = createEngine();
    const renderer = createRenderer(engine);

    // floor
    engine.addShapes2(
        Shapes.rectangle(0, 5, 30, 5, 0, true),
        Shapes.rectangle(40, 5, 50, 5, 0, true),
    );

    // bridge
    engine.addShapes2(
        Shapes.complexRectangle(5, 20, 30, 5, 7, 0.01)
    )

    // boxes
    engine.addShapes2(
        // bottom line
        Shapes.rectangle(45 + 0, 11, 5, 5, 0),
        Shapes.rectangle(45 + 6, 11, 5, 5, 0),
        Shapes.rectangle(45 + 12, 11, 5, 5, 0),
        // middle line
        Shapes.rectangle(45 + 3, 17, 5, 5, 0),
        Shapes.rectangle(45 + 9, 17, 5, 5, 0),
        // top line
        Shapes.rectangle(45 + 5, 23, 5, 5, 0),
    );
    //
    // const s1 = Shapes.rectangle(45.001, 11.001, 5, 5, 0);
    // const s2 = Shapes.rectangle(45, 17, 5, 5, 0);
    // engine.addShapes2(s1, s2);

    // const p1 = Points.create(40, 6);
    // engine.addPoints(p1);

    const registerShooting = (canvas: HTMLCanvasElement) =>
    {
        shoot$(canvas).subscribe(downUp =>
        {
            const direction = vec2.subtract(vec2.create(), downUp[0], downUp[1]);
            const angle = -Math.atan2(downUp[1][1] - downUp[0][1], downUp[1][0] - downUp[0][0]);
            console.log(angle);
            const distance = vec2.len(direction);
            vec2.normalize(direction, direction);
            vec2.scale(direction, direction, distance / 2);

            const position = renderer.transform().toSimulation(downUp[0][0], downUp[0][1]);
            const bullet = Shapes.rectangle(position.x, position.y, 5, 5, 0);
            Shapes.rotate(bullet, angle);

            // y must be inversed
            Shapes.setVelocity(bullet, vec2.fromValues(direction[0], -direction[1]));
            engine.addShapes2(bullet);
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

    const render = (p5: p5Types) =>
    {
        // renderer.lookAt(s2.points[1].position[0], s2.points[1].position[1]);
        renderer.lookAt(40, 10);
        renderer.setSimulatorMinWidth(50);

        engine.simulate(1 / 60);
        renderer.render(p5);
    }

    const setup = (p5: p5Types, canvas: HTMLCanvasElement) =>
    {
        renderer.render(p5);
        registerShooting(canvas);
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
    </div>
}