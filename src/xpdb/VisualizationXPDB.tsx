import {Renderer} from "../components/Renderer";
import p5Types from "p5";
import {createEngine} from "./engine/Engine";
import {createRenderer} from "./renderer/Renderer";
import {Shape, Shapes} from "./engine/Shape";
import {drag$, mouseDown$, shoot$} from "./renderer/CanvasUtils";
import {vec2} from "gl-matrix";
import {delay, fromEvent, timer} from "rxjs";
import React, {useEffect, useState} from "react";
import {SettingsSidebar} from "./SettingsSidebar";

export const VisualizationXPDB = () =>
{
    const [shapes, setShapes] = useState<Shape[]>([]);
    const engine = createEngine();
    const renderer = createRenderer(engine);

    // boxes
    engine.addShapes(
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

    // engine.addShapes(
    //     Shapes.createRectangle(45, 10, 5, 5, 0),
    //     Shapes.createRectangle(45, 16, 5, 5, 0),
    // );

    // floor
    engine.addShapes(
        Shapes.rectangle(0, 5, 30, 5, 0, true),
        Shapes.rectangle(40, 5, 50, 5, 0, true),
    );
    engine.addShapes();

    useEffect(() =>
    {
        const sub = timer(1000).subscribe(() =>
        {
            setShapes(engine.shapes);
        });

        return () => sub.unsubscribe();
    }, [])

    const registerShooting = (canvas: HTMLCanvasElement) =>
    {
        mouseDown$(canvas, 2)
            .subscribe(p =>
            {
                const position = renderer.transform().toSimulation(p[0], p[1]);
                const box = Shapes.rectangle(position.x -2.5, position.y-2.5, 5, 5, 0);
                engine.addShapes(box);
            });

        shoot$(canvas).subscribe(downUp =>
        {
            //TODO: wtf?
            const direction = vec2.subtract(vec2.create(), downUp[0], downUp[1]);
            const angle = vec2.angle(direction, vec2.fromValues(1, 0)) * (180 / Math.PI);

            const distance = vec2.len(direction);
            vec2.normalize(direction, direction);
            vec2.scale(direction, direction, distance / 10);

            const position = renderer.transform().toSimulation(downUp[0][0], downUp[0][1]);
            const bullet = Shapes.rectangle(position.x -2.5, position.y-2.5, 5, 5, 0);
            Shapes.rotate(bullet, angle);

            // y must be inversed
            Shapes.setVelocity(bullet, vec2.fromValues(direction[0], -direction[1]));
            engine.addShapes(bullet);
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
            <SettingsSidebar shapes={shapes} renderer={renderer} />
        </div>
    </div>
}