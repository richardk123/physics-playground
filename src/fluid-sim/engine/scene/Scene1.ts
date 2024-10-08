import {Engine} from "../Engine";
import {ParticleFormations} from "../entitity/ParticleFormation";
import {Colors} from "../entitity/Color";
import {WORLD_MAX_X, WORLD_MAX_Y, WORLD_MIN_X, WORLD_MIN_Y} from "../constraint/FloorConstraint";

export const createScene1 = (engine: Engine, bodies: ParticleFormations) =>
{

    // bowl
    bodies.randomRectangle(
        WORLD_MIN_X,
        WORLD_MIN_Y,
        WORLD_MAX_X - WORLD_MIN_X,
        WORLD_MAX_Y - WORLD_MIN_Y,
        2000,
        1, Colors.blue());
}