import {PointMass} from "./PointMass";
import {vec2} from "gl-matrix";
import {GRAVITY} from "./PhysicsConstants";
import {Constraint} from "./solver/Constraint";

export interface Engine
{
    addPoints: (...points: PointMass[]) => void;
    addConstraints: (...constraints: Constraint[]) => void,
    simulate: (dt: number) => void;
    points: PointMass[];
    constraints: Constraint[];
}
export const createEngine = () =>
{
    const pointMasses: PointMass[] = [];
    const constraints: Constraint[] = [];

    const preSolve = (dt: number) =>
    {
        pointMasses.forEach(pm =>
        {
            if (!pm.isStatic)
            {
                // gravity
                const g = vec2.scale(vec2.create(), GRAVITY, dt);
                vec2.add(pm.velocity, pm.velocity, g);

                // update previous position
                vec2.set(pm.previousPosition, pm.position[0], pm.position[1]);

                // update current position with velocity
                const step = vec2.scale(vec2.create(), pm.velocity, dt);
                vec2.add(pm.position, pm.position, step);
            }
        });
    }

    const solve = (dt: number) =>
    {
        constraints.forEach(c =>
        {
            c.solve(dt);
        })
    }

    const postSolve = (dt: number) =>
    {
        pointMasses.forEach(pm =>
        {
            const newVelocity = vec2.subtract(vec2.create(), pm.position, pm.previousPosition);
            vec2.scale(newVelocity, newVelocity, 1 / dt);

            vec2.set(pm.velocity, newVelocity[0], newVelocity[1]);
        });
    }

    const simulate = (dt: number) =>
    {
        const subSteps = 8;
        const ddt = dt / subSteps;

        for (let i = 0; i < subSteps; i++)
        {
            preSolve(ddt);
            solve(ddt);
            postSolve(ddt);
        }
    }

    return {
        addPoints: (...points: PointMass[]) => pointMasses.push(...points),
        addConstraints: (...cs: Constraint[]) => constraints.push(...cs),
        simulate: simulate,
        points: pointMasses,
        constraints: constraints,
    } as Engine;
}