import {Renderer} from "../components/Renderer";
import p5Types from "p5";
import {createEngine, Engine} from "./engine/Engine";
import {renderEngine} from "./renderer/Renderer";
import {Points} from "./engine/PointMass";
import {Constraints} from "./engine/solver/Constraint";
import {useEffect, useState} from "react";

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