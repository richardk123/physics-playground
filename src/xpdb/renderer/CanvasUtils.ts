import {
    from,
    fromEvent,
    map,
    zip
} from "rxjs";
import {vec2} from "gl-matrix";

const transformEvent = (e: Event, canvas: HTMLCanvasElement) =>
{
    const me = e as MouseEvent;
    return vec2.fromValues(me.x - canvas.offsetLeft, me.y - canvas.offsetTop);
}

export const shoot$ = (canvas: HTMLCanvasElement) =>
{
    const mouseDown$ = fromEvent(canvas, 'mousedown')
        .pipe(map(e => transformEvent(e, canvas)));
    const mouseUp$ = fromEvent(canvas, 'mouseup')
        .pipe(map(e => transformEvent(e, canvas)));

    return zip(mouseDown$, mouseUp$);
}

export interface Point
{
    x: number;
    y: number;
}

export interface Transform
{
    toSimulation: (x: number, y: number) => Point,
    toScreen: (x: number, y: number) => Point,
    simulatorWidth: number,
    simulatorHeight: number,
}

export const createTransform = (width = 800,
                                height= 600,
                                lookAtPos = vec2.create(),
                                simulatorMinWidth = 40) =>
{
    const cScale = Math.min(width, height) / simulatorMinWidth;
    const simWidth = width / cScale;
    const simHeight = height / cScale;

    const toScreen = (x: number, y: number) =>
    {
        const xn = x * cScale;
        const yn = height - y * cScale;
        return {x: xn, y: yn} as Point;
    }

    const toSimulation = (x: number, y: number) => {
        const xn = x / cScale;
        const yn = (height - y) / cScale;
        return { x: xn, y: yn } as Point;
    }


    return {
        toSimulation: toSimulation,
        toScreen: toScreen,
        simulatorWidth: simWidth,
        simulatorHeight: simHeight,
    } as Transform;
}