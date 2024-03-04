import {Engine} from "../Engine";
import {ParticleFormations} from "../entitity/ParticleFormation";
import {Colors} from "../entitity/Color";

export const createScene1 = (engine: Engine, bodies: ParticleFormations) =>
{

    // bowl
    bodies.rope(0, 50, 40, 50, 0, 0.5, 0.01)
        .withLastPointStatic()
        .withFirstPointStatic();

    // // water
    bodies.rectangle(15, 55, 8, 12, 1, Colors.blue());

    // house
    bodies.rectangle(90, 0, 10, 25, 1, Colors.pink())
        .withNeighbouringConstraints(0, 0.01);

    // pendulum 1
    {
        const rope1 = bodies.rope(50, 90, 30, 90, 0)
            .withFirstPointStatic();
        const circle1 = bodies.circle(30, 85, 5, 0, 0.5, 1);
        engine.addDistanceConstraint(rope1.indexTo, circle1.indexFrom, 1);
    }

    // pendulum 2
    {
        const rope2 = bodies.rope(60, 90, 60, 70, 0)
            .withFirstPointStatic();
        const circle2 = bodies.circle(60, 65, 5, 0, 0.5, 1);
        engine.addDistanceConstraint(rope2.indexTo, circle2.indexFrom, 1);
    }

    // pendulum 3
    {
        const rope3 = bodies.rope(71, 90, 71, 70, 0)
            .withFirstPointStatic();
        const circle3 = bodies.circle(71, 65, 5, 0, 0.5, 1);
        engine.addDistanceConstraint(rope3.indexTo, circle3.indexFrom);
    }

    // bodies.circle(40, 40, 10, 0, 100, 1);
}