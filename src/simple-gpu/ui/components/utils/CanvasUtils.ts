import {combineLatest, filter, fromEvent, map, repeat, startWith, switchMap, takeUntil, timer} from "rxjs";
import {vec2} from "gl-matrix";
import {Vec2d} from "../../../engine/data/Vec2d";

const transformEvent = (e: Event, canvas: HTMLCanvasElement) =>
{
    const me = e as MouseEvent;
    return vec2.fromValues(me.x - canvas.offsetLeft, me.y - canvas.offsetTop);
}

export const scroll$ = (canvas: HTMLCanvasElement) =>
{
    return fromEvent<WheelEvent>(canvas, 'wheel').pipe(
        map(event =>
        {
            event.preventDefault();
            event.stopPropagation();
            return event.deltaY;
        })
    );
}

export const dragAndDrop$ = (canvas: HTMLCanvasElement, originalVal: () => Vec2d, button = 0) =>
{
    const mouseDown$ = fromEvent(canvas, 'mousedown')
        .pipe(
            filter(e => (e as MouseEvent).button === button),
            map(e => ({downPos: transformEvent(e, canvas), originalVal: originalVal()})));

    const mouseUp$ = fromEvent(canvas, 'mouseup')
        .pipe(filter(e => (e as MouseEvent).button === button));

    const mouseMove$ = fromEvent(document, 'mousemove')
        .pipe(
            filter(e => (e as MouseEvent).button === button),
            map(e => transformEvent(e, canvas)));

    // Create a timer that emits values every 10 milliseconds
    const timer$ = timer(0, 10);

    // Combine the mouseMove$ and timer$ observables
    const drag$ = combineLatest([mouseMove$, timer$])
        .pipe(
            map(([event]) => event),
            startWith(null),);

    return mouseDown$
        .pipe(
            switchMap(downValues =>
            {
                return drag$.pipe(
                    filter(movePos => movePos !== null),
                    map(movePos =>  movePos!),
                    map(movePos =>
                        {
                            return {
                                originalPosition: downValues.originalVal,
                                position: vec2.clone(downValues.downPos),
                                endPosition: vec2.clone(movePos)};
                        }
                    ))
            }),
            takeUntil(mouseUp$),
            repeat() // Resubscribe to mouseDown$ after drag is completed
        );
}