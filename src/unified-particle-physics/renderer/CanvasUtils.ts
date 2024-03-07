import {
    combineLatest, filter,
    fromEvent,
    map, repeat, startWith, switchMap, takeUntil, timer,
    zip
} from "rxjs";
import {vec2} from "gl-matrix";

const transformEvent = (e: Event, canvas: HTMLCanvasElement) =>
{
    const me = e as MouseEvent;
    return vec2.fromValues(me.x - canvas.offsetLeft, me.y - canvas.offsetTop);
}

export const mouseMove$ =  (canvas: HTMLCanvasElement) =>
{
    return fromEvent(canvas, 'mousemove')
        .pipe(map(e => transformEvent(e, canvas)));
}
