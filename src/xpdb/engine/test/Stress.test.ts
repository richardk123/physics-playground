import {createEngine} from "../Engine";
import {Bodies} from "../entity/Body";
import {Constraints} from "../constraint/Constraint";
import {Polygon} from "../entity/Polygon";

// unoptimalized 718
test('stressTest', () =>
{
    const measurements = [];
    for (let i = 0; i < 50; i++)
    {
        measurements.push(stress());
    }

    console.log(measurements.reduce((sum, value) => sum + value) / measurements.length);

});

const stress = () =>
{
    const t1 = performance.now();

    const engine = createEngine();
    engine.addBodies(
        Bodies.rectangle(0, 0, 100, 100, 0),
    );
    engine.addConstraints(Constraints.pointCollision(engine.points));
    engine.addConstraints(
        Constraints.polygonCollision(
            Polygon.rectangle(0, 0, 100, 100),
            engine.points));

    engine.simulate(1);

    return performance.now() - t1;
}