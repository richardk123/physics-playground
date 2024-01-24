import {Renderer} from "../components/Renderer";
import p5Types from "p5";
import {createEngine, Engine} from "./engine/Engine";
import {renderEngine} from "./renderer/Renderer";
import {Constraints} from "./engine/constraint/Constraint";
import {useEffect, useState} from "react";
import {Shapes} from "./engine/Shape";
import {canvasTransform, shoot$} from "./renderer/CanvasUtils";
import {vec2} from "gl-matrix";

export const VisualizationXPDB = () =>
{
    const engine = createEngine();

    // boxes

    engine.addShapes(
        // bottom line
        Shapes.createRectangle(45 + 0, 11, 5, 5, 0),
        Shapes.createRectangle(45 + 6, 11, 5, 5, 0),
        Shapes.createRectangle(45 + 12, 11, 5, 5, 0),
        // middle line
        Shapes.createRectangle(45 + 3, 17, 5, 5, 0),
        Shapes.createRectangle(45 + 9, 17, 5, 5, 0),
        // top line
        Shapes.createRectangle(45 + 5, 23, 5, 5, 0),
    );

    // floor
    engine.addShapes(
        Shapes.createRectangle(0, 5, 30, 5, 0, true),
        Shapes.createRectangle(40, 5, 50, 5, 0, true),
    );
    engine.addShapes();

    const registerShooting = (canvas: HTMLCanvasElement) =>
    {
        shoot$(canvas).subscribe(downUp =>
        {
            const direction = vec2.subtract(vec2.create(), downUp[0], downUp[1]);
            const distance = vec2.len(direction);
            vec2.normalize(direction, direction);
            vec2.scale(direction, direction, distance / 10);

            const transform = canvasTransform(canvas);

            const position = transform.toSimulation(downUp[0][0], downUp[0][1]);
            const bullet = Shapes.createRectangle(position.x, position.y, 5, 5, 0);

            // y must be inversed
            Shapes.setVelocity(bullet, vec2.fromValues(direction[0], -direction[1]));
            if (engine)
            {
                engine.addShapes(bullet);
            }
        });
    }

    const render = (p5: p5Types, canvas: HTMLCanvasElement) =>
    {
        engine.simulate(1 / 60);
        renderEngine(p5, canvas, engine);
    }

    const setup = (p5: p5Types, canvas: HTMLCanvasElement) =>
    {
        registerShooting(canvas);
    }

    return <>
        <Renderer render={render} setup={setup}/>
    </>
}