import {Engine} from "../Engine";
import {ParticleFormations} from "../entitity/ParticleFormation";
import {Colors} from "../entitity/Color";

export const createScene2 = (engine: Engine, bodies: ParticleFormations) =>
{

    bodies.rectangle(
        20,
        20,
        40,
        49,
        1,
        Colors.blue());

    bodies.collisionCircle(10, 10, 10);
}