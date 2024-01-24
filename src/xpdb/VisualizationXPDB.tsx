import {Renderer} from "../components/Renderer";
import p5Types from "p5";
import {createEngine, Engine} from "./engine/Engine";
import {renderEngine} from "./renderer/Renderer";
import {Constraints} from "./engine/constraint/Constraint";
import {useEffect, useState} from "react";
import {Shapes} from "./engine/Shape";

export const VisualizationXPDB = () =>
{
    const [engine, setEngine] = useState<Engine | undefined>(undefined);

    useEffect(() =>
    {
        const engine = createEngine();
        //
        // // stiff
        // const twoPointsStiff = [
        //     Points.create(5, 15, Infinity, true),
        //     Points.create(6, 17)
        // ]
        // engine.addPoints(...twoPointsStiff);
        // engine.addConstraints(Constraints.distance(0, ...twoPointsStiff));
        //
        // // stiff
        // const twoPointsSpringy = [
        //     Points.create(5, 7, Infinity, true),
        //     Points.create(6, 9)
        // ]
        // engine.addPoints(...twoPointsSpringy);
        // engine.addConstraints(Constraints.distance(0.1, ...twoPointsSpringy));
        //
        // // pendulum stiff
        // const stiffPoints = [
        //     Points.create(15, 10, Infinity, true),
        //     Points.create(16, 12, .1),
        //     Points.create(16, 13, 1),
        //     Points.create(16, 14, .1)
        // ];
        // engine.addPoints(...stiffPoints);
        // engine.addConstraints(Constraints.distance(0, ...stiffPoints));
        //
        // // pendulum stiff
        // const springyPoints = [
        //     Points.create(20, 10, Infinity, true),
        //     Points.create(21, 12, .1),
        //     Points.create(21, 13, 1),
        //     Points.create(21, 14, .1)
        // ];
        // engine.addPoints(...springyPoints);
        // engine.addConstraints(Constraints.distance(0.05, ...springyPoints));


        // // shape 1
        // const s1 = shapes.createComplexRectangle(vec2.fromValues(10, 15), 10, 2, 10, 0.001);
        // s1.points[0].mass = Infinity;
        // s1.points[0].isStatic = true;

        // shape 1
        const box1 = Shapes.createRectangle(41, 10, 5, 5, 0, false, "bottom-box");
        // Shapes.rotate(box1, 50);
        const box2 = Shapes.createRectangle(47, 10, 5, 5, 0, false, "top-box");
        const box3 = Shapes.createRectangle(43, 20, 5, 5, 0, false, "top-box");
        // const s2 = Shapes.createComplexRectangle(25, 40, 20, 2, 10, 0.0005);
        // Shapes.rotate(s2, 50);

        engine.addShapes(box1, box2, box3);
        engine.addConstraints(...Constraints.shapeCollision(box1, box2, 0));
        engine.addConstraints(...Constraints.shapeCollision(box2, box3, 0));
        engine.addConstraints(...Constraints.shapeCollision(box1, box3, 0));

        // volume constraint
        engine.addConstraints(Constraints.volume(0, 5, 30, 5, 0, ...engine.points));
        engine.addConstraints(Constraints.volume(40, 5, 50, 5, 0, ...engine.points));
        setEngine(engine);

    }, [])

    const render = (p5: p5Types) =>
    {
        if (engine)
        {
            engine.simulate(1 / 60);
            renderEngine(p5, engine);
        }
    }

    return <>
        <Renderer render={render} setup={() => {}}/>
    </>
}