
// unoptimalized 741
// optimalized 384
// second optimalized 277
import {Engines} from "../Engine";
import {Bodies} from "../Body";


// changed alg
// hashmap 54344
// optimalized 3708
test('stressTest', () =>
{
    const measurements = [];
    measurements.push(stress());

    console.log(measurements.reduce((sum, value) => sum + value) / measurements.length);
});

const stress = () =>
{
    const t1 = performance.now();

    const engine = Engines.create();
    const bodies = new Bodies(engine);

    bodies.rectangle(0, 0, 100, 100, 0);
    for (let i = 0; i < 50; i++)
    {
        engine.simulate(1);
    }

    return performance.now() - t1;
}