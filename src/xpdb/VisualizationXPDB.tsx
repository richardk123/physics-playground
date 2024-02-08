import {Renderer} from "../components/Renderer";
import p5Types from "p5";
import {createEngine} from "./engine/Engine";
import {createRenderer} from "./renderer/Renderer";
import {drag$, shoot$} from "./renderer/CanvasUtils";
import {vec2} from "gl-matrix";
import {delay, fromEvent} from "rxjs";
import React from "react";
import {SettingsSidebar} from "./SettingsSidebar";
import {Constraints} from "./engine/constraint/Constraint";
import {Polygon} from "./engine/entity/Polygon";
import {Bodies} from "./engine/entity/Body";
import {body} from "@material-tailwind/react/theme/base/typography";

export const VisualizationXPDB = () =>
{
    const engine = createEngine();
    const renderer = createRenderer(engine);
    renderer.lookAt(45, 20);
    renderer.setSimulationWidth(60);

    // rope
    // const rope = Bodies.rope(10, 30, 10, 0);
    // const rect = Bodies.rectangle(10, 18, 3, 3, 0);
    // engine.addConstraints(Constraints.attachBodyToRope(rope, rect, 0));
    // engine.addBodies(rope, rect);
    //
    // // soft body
    // engine.addBodies(
    //     Bodies.rectangle(16, 20, 5, 5, 0.001, 1, "soft-body-1"),
    //     Bodies.rectangle(16, 30, 5, 5, 0.001, 1, "soft-body-2"),
    // );

    // boxes
    // engine.addBodies(
    //     // bottom line
    //     Bodies.rectangle(45 + 0, 11, 5, 5, 0),
    //     Bodies.rectangle(45 + 6, 11, 5, 5, 0),
    //     Bodies.rectangle(45 + 12, 11, 5, 5, 0),
    //     // middle line
    //     Bodies.rectangle(45 + 3, 17, 5, 5, 0),
    //     Bodies.rectangle(45 + 9, 17, 5, 5, 0),
    //     // top line
    //     Bodies.rectangle(45 + 6, 23, 5, 5, 0),
    // );

    // bridge
    // engine.addBodies(
    //     Bodies.rectangle(25, 23, 20, 5, 0.00001),
    // );

    // point collisions
    engine.addConstraints(Constraints.pointCollision(engine.points));

    // floor
    engine.addConstraints(
        Constraints.polygonCollision(
            Polygon.rectangle(0, 5, 30, 5),
            engine.points),
        Constraints.polygonCollision(Polygon.rectangle(40, 5, 50, 5),
            engine.points));

    const registerShooting = (canvas: HTMLCanvasElement) =>
    {
        shoot$(canvas).subscribe(downUp =>
        {
            const direction = vec2.subtract(vec2.create(), downUp[0], downUp[1]);
            const angle = -Math.atan2(downUp[1][1] - downUp[0][1], downUp[1][0] - downUp[0][0]);
            const distance = vec2.len(direction);
            vec2.normalize(direction, direction);
            vec2.scale(direction, direction, distance / 2);

            const position = renderer.transform().toSimulation(downUp[0][0], downUp[0][1]);
            const bullet = Bodies.rectangle(position.x, position.y, 2, 2, 0);
            Bodies.rotate(bullet, angle);

            // y must be inversed
            Bodies.setVelocity(bullet, vec2.fromValues(direction[0], -direction[1]));
            engine.addBodies(bullet);
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