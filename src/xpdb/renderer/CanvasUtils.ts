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

export const canvasTransform = (canvas: HTMLCanvasElement) =>
{
    const simMinWidth = 50;
    const cScale = Math.min(canvas.clientWidth, canvas.clientHeight) / simMinWidth;
    const simWidth = canvas.clientWidth / cScale;
    const simHeight = canvas.clientHeight / cScale;

    const toScreen = (x: number, y: number) =>
    {
        const xn = x * cScale;
        const yn = canvas.clientHeight - y * cScale;
        return {x: xn, y: yn};
    }

    const toSimulation = (x: number, y: number) => {
        const xn = x / cScale;
        const yn = (canvas.clientHeight - y) / cScale;
        return { x: xn, y: yn };
    }

    return {
        toSimulation: toSimulation,
        toScreen: toScreen,
    }
}