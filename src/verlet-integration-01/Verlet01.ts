import { vec2 } from 'gl-matrix';
import p5Types from "p5";

export const OBJECT_RADIUS = 10;
export const GRAVITY = vec2.fromValues(0, 40);
const CONSTRAINT_CENTER = vec2.fromValues(250, 250);
const CONSTRAINS_RADIUS = 250;
const SUB_STEP_COUNT = 8;

type VerletObject = {
    position: vec2;
    prevPosition: vec2;
    acceleration: vec2;
}

interface Engine
{
    add: (position: vec2, acceleration: vec2) => void;
    render: (p5: p5Types) => void;
}
export const createEngine = () =>
{
    const objects: VerletObject[] = [];

    return {
        add: (position: vec2, acceleration: vec2) =>
        {
            objects.push({position: position, prevPosition: vec2.copy(vec2.create(), position), acceleration: acceleration});
        },
        render: (p5: p5Types) =>
        {
            simulate(objects, 60 / 1000)
            render(p5, objects);
        },
    } as Engine
}

const simulate = (objects: VerletObject[], dt: number) =>
{
    const subStepDt = dt / SUB_STEP_COUNT;

    for (let subStep = 0; subStep < SUB_STEP_COUNT; subStep++)
    {
        applyGravity(objects);
        resolveConstraints(objects);
        updatePosition(objects, subStepDt);
    }
}

const applyGravity = (objects: VerletObject[]) =>
{
    objects.forEach(o =>
    {
        vec2.add(o.acceleration, o.acceleration, GRAVITY);
    })
}

const updatePosition = (objects: VerletObject[], dt: number) =>
{
    objects.forEach(o =>
    {
        const displacement = vec2.subtract(vec2.create(), o.position, o.prevPosition);

        vec2.copy(o.prevPosition, o.position);

        const acceleration = vec2.scale(vec2.create(), o.acceleration, dt * dt);
        const disAcc = vec2.add(vec2.create(), displacement, acceleration);
        vec2.add(o.position, o.position, disAcc);

        vec2.set(o.acceleration, 0, 0);
    })
}

const resolveConstraints = (objects: VerletObject[]) =>
{
    objects.forEach(o =>
    {
        const distance = vec2.distance(o.position, CONSTRAINT_CENTER);

        if (distance + OBJECT_RADIUS > CONSTRAINS_RADIUS)
        {
            const dist = vec2.subtract(vec2.create(), CONSTRAINT_CENTER, o.position);
            const moveDirection = vec2.normalize(dist, dist);

            const scaledMove = vec2.scale(vec2.create(), moveDirection, distance - CONSTRAINS_RADIUS + OBJECT_RADIUS);
            console.log(vec2.add(o.position, o.position, scaledMove));
        }
    })
}

const render = (p5: p5Types, objects: VerletObject[]) =>
{
    p5.stroke(50, 50, 50);
    p5.fill(50, 50, 50);
    p5.ellipse(CONSTRAINT_CENTER[0], CONSTRAINT_CENTER[1], CONSTRAINS_RADIUS * 2);

    p5.stroke(255, 255, 255);
    p5.fill(255, 255, 255);
    for (let i= 0; i < objects.length; i++)
    {
        const object = objects[i];
        p5.ellipse(object.position[0], object.position[1], OBJECT_RADIUS * 2);
    }
}