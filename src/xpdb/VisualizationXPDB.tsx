import {Renderer} from "../components/Renderer";
import p5Types from "p5";
import {createEngine, Engine} from "./engine/Engine";
import {createRenderer} from "./renderer/Renderer";
import {Shapes} from "./engine/Shape";
import {createTransform, shoot$} from "./renderer/CanvasUtils";
import {vec2} from "gl-matrix";

export const VisualizationXPDB = () =>
{
    const engine = createEngine();
    const renderer = createRenderer(engine);

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

    // engine.addShapes(
    //     Shapes.createRectangle(45, 10, 5, 5, 0),
    //     Shapes.createRectangle(45, 16, 5, 5, 0),
    // );

    // floor
    engine.addShapes(
        Shapes.createRectangle(0, 5, 30, 5, 0, true),
        Shapes.createRectangle(40, 5, 50, 5, 0, true),
    );
    engine.addShapes();

    const registerShooting = (canvas: HTMLCanvasElement) =>
    {
        const t = shoot$(canvas).subscribe(downUp =>
        {
            const direction = vec2.subtract(vec2.create(), downUp[0], downUp[1]);
            const angle = vec2.angle(direction, vec2.fromValues(1, 0)) * (180 / Math.PI);

            const distance = vec2.len(direction);
            vec2.normalize(direction, direction);
            vec2.scale(direction, direction, distance / 10);


            const position = renderer.transform().toSimulation(downUp[0][0], downUp[0][1]);
            const bullet = Shapes.createRectangle(position.x -2.5, position.y-2.5, 5, 5, 0);
            Shapes.rotate(bullet, angle);

            // y must be inversed
            Shapes.setVelocity(bullet, vec2.fromValues(direction[0], -direction[1]));
            if (engine)
            {
                engine.addShapes(bullet);
            }
        });
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

    return <>
        <Renderer render={render} setup={setup}/>
    </>
}