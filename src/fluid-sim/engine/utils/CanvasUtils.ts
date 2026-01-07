import {
    combineLatest, filter,
    fromEvent,
    map, repeat, startWith, switchMap, takeUntil, timer,
    zip
} from "rxjs";
import { vec2 } from "gl-matrix";

const transformEvent = (e: Event, canvas: HTMLCanvasElement) => {
    const me = e as MouseEvent;
    const rect = canvas.getBoundingClientRect();
    return vec2.fromValues(me.clientX - rect.left, me.clientY - rect.top);
}

export const mouseMove$ = (canvas: HTMLCanvasElement) => {
    return fromEvent(canvas, 'mousemove')
        .pipe(map(e => transformEvent(e, canvas)));
}
