import {PointMass} from "./PointMass";
import {vec2} from "gl-matrix";
import {GRAVITY, SUB_STEPS} from "./PhysicsConstants";
import {Constraint, Constraints} from "./constraint/Constraint";
import {Shape, Shapes} from "./Shape";

export interface Engine
{
    addPoints: (...points: PointMass[]) => void;
    addConstraints: (...constraints: Constraint[]) => void,
    addShapes: (...shapes: Shape[]) => void;
    addShapes2: (...shapes: Shape[]) => void;
    simulate: (dt: number) => void;
    points: PointMass[];
    constraints: Constraint[];
    shapes: Shape[];
}
export const createEngine = () =>
{
    const pointMasses: PointMass[] = [];
    const constraints: Constraint[] = [];
    const shapes: Shape[] = [];

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
        console.log(dt);
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

    const addShapes = (...addedShapes: Shape[]) =>
    {
        if (addedShapes.length > 1)
        {
            for (let i = 0; i < addedShapes.length - 1; i++)
            {
                const cur = addedShapes[i];
                for (let j = i + 1; j < addedShapes.length; j++)
                {
                    const next = addedShapes[j];
                    addConstraints(...Constraints.shapeCollision(cur, next, 0));
                }
            }
            addConstraints(...Constraints.shapeCollision(addedShapes[0], addedShapes[addedShapes.length - 1], 0));
        }

        shapes.forEach(shape =>
        {
            addedShapes.forEach(addedShape =>
            {
                addConstraints(...Constraints.shapeCollision(shape, addedShape, 0));
            });
        });
        // set name and index
        addedShapes.forEach((s, i) =>
        {
            s.index = shapes.length + i;
        })

        pointMasses.push(...addedShapes.flatMap(s => s.points));
        addConstraints(...addedShapes.flatMap(s => s.constraints));
        shapes.push(...addedShapes);
    }

    const addShapes2 = (...addedShapes: Shape[]) =>
    {

        if (addedShapes.length > 1)
        {
            for (let i = 0; i < addedShapes.length - 1; i++)
            {
                const cur = addedShapes[i];
                for (let j = i + 1; j < addedShapes.length; j++)
                {
                    const next = addedShapes[j];
                    addConstraints(Constraints.shapeCollision2(cur, next, 0));
                }
            }
        }

        shapes.forEach(shape =>
        {
            addedShapes.forEach(addedShape =>
            {
                addConstraints(Constraints.shapeCollision2(shape, addedShape, 0));
            });
        });

        // set name and index
        addedShapes.forEach((s, i) =>
        {
            s.index = shapes.length + i;
        })

        pointMasses.push(...addedShapes.flatMap(s => s.points));
        addConstraints(...addedShapes.flatMap(s => s.constraints));
        shapes.push(...addedShapes);
    }

    return {
        addPoints: addPoints,
        addConstraints: addConstraints,
        addShapes: addShapes,
        addShapes2: addShapes2,
        simulate: simulate,
        points: pointMasses,
        constraints: constraints,
        shapes: shapes,
    } as Engine;
}