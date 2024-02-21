
// unoptimalized 741
// optimalized 364
import {Engines} from "../Engine";
import {Bodies} from "../Body";

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

    const engine = Engines.create();
    const bodies = new Bodies(engine);

    bodies.rectangle(0, 0, 100, 100, 0);
    engine.simulate(1);

    return performance.now() - t1;
}