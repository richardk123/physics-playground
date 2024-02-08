import {vec2} from "gl-matrix";

export type PointMass =
{
    position: vec2;
    previousPosition: vec2;
    mass: number;
    velocity: vec2;
    isStatic: boolean;
}

export class Points
{
    static create(x: number, y: number, mass?: number, isStatic?: boolean)
    {
        const position = vec2.fromValues(x, y);
        const previousPosition = vec2.clone(position);
        return {
            position: position,
            previousPosition: previousPosition,
            mass: mass || 1,
            velocity: vec2.create(),
            isStatic: isStatic || false} as PointMass;
    }
}