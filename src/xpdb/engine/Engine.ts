import {PointMass} from "./entity/PointMass";
import {vec2} from "gl-matrix";
import {GRAVITY, SUB_STEPS} from "./PhysicsConstants";
import {Constraint} from "./constraint/Constraint";
import {Body} from "./entity/Body";

export interface Engine
{
    addPoints: (...points: PointMass[]) => void;
    addConstraints: (...constraints: Constraint[]) => void,
    addBodies: (...bodies: Body[]) => void;
    simulate: (dt: number) => void;
    points: PointMass[];
    constraints: Constraint[];
    bodies: Body[];
}
export const createEngine = () =>
{
    const pointMasses: PointMass[] = [];
    const constraints: Constraint[] = [];
    const bodies: Body[] = [];

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
        const ddt = dt / SUB_STEPS;
        for (let i = 0; i < SUB_STEPS; i++)
        {
            preSolve(ddt);
            solve(ddt);
            postSolve(ddt);
        }
    }

    const addConstraints = (...cs: Constraint[]) =>
    {
        constraints.push(...cs);
    }

    const addPoints = (...points: PointMass[]) =>
    {
        pointMasses.push(...points);
    }

    const addBodies = (...b: Body[]) =>
    {
        b.forEach(b =>
        {
            addPoints(...b.points);
            addConstraints(...b.constraints);
        });

        bodies.push(...b);
    }

    return {
        addPoints: addPoints,
        addConstraints: addConstraints,
        addBodies: addBodies,
        simulate: simulate,
        points: pointMasses,
        constraints: constraints,
        bodies: bodies,
    } as Engine;
}