import {Renderer} from "../components/Renderer";
import p5Types from "p5";
import {createEngine, Engine} from "./engine/Engine";
import {renderEngine} from "./renderer/Renderer";
import {Points} from "./engine/PointMass";
import {Constraints} from "./engine/constraint/Constraint";
import {useEffect, useState} from "react";
import {Shapes} from "./engine/Shape";
import {vec2} from "gl-matrix";

export const VisualizationXPDB = () =>
{
    const [engine, setEngine] = useState<Engine | undefined>(undefined);

    useEffect(() =>
    {
        const engine = createEngine();

        // stiff
        const twoPointsStiff = [
            Points.create(5, 15, Infinity, true),
            Points.create(6, 17)
        ]
        engine.addPoints(...twoPointsStiff);
        engine.addConstraints(Constraints.distance(0, ...twoPointsStiff));

        // stiff
        const twoPointsSpringy = [
            Points.create(5, 7, Infinity, true),
            Points.create(6, 9)
        ]
        engine.addPoints(...twoPointsSpringy);
        engine.addConstraints(Constraints.distance(0.1, ...twoPointsSpringy));

        // pendulum stiff
        const stiffPoints = [
            Points.create(15, 10, Infinity, true),
            Points.create(16, 12, .1),
            Points.create(16, 13, 1),
            Points.create(16, 14, .1)
        ];
        engine.addPoints(...stiffPoints);
        engine.addConstraints(Constraints.distance(0, ...stiffPoints));

        // pendulum stiff
        const springyPoints = [
            Points.create(20, 10, Infinity, true),
            Points.create(21, 12, .1),
            Points.create(21, 13, 1),
            Points.create(21, 14, .1)
        ];
        engine.addPoints(...springyPoints);
        engine.addConstraints(Constraints.distance(0.05, ...springyPoints));

        const shapes = new Shapes(engine);

        // shape 1
        const s1 = shapes.createComplexRectangle(vec2.fromValues(10, 15), 10, 2, 10, 0.001);
        s1.points[0].mass = Infinity;
        s1.points[0].isStatic = true;

        // shape 1
        shapes.createComplexRectangle(vec2.fromValues(25, 15), 20, 2, 10, 0.001);

        // volume constraint
        engine.addConstraints(Constraints.volume(0, 5, 30, 5, 0, ...engine.points));
        engine.addConstraints(Constraints.volume(40, 5, 30, 5, 0, ...engine.points));
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