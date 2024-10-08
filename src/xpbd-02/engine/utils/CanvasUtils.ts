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

export const shoot$ = (canvas: HTMLCanvasElement, button = 0) =>
{
    const mouseDown$ = fromEvent(canvas, 'mousedown')
        .pipe(
            filter(e => (e as MouseEvent).button === button),
            map(e => transformEvent(e, canvas))
        );
    const mouseUp$ = fromEvent(canvas, 'mouseup')
        .pipe(
            filter(e => (e as MouseEvent).button === button),
            map(e => transformEvent(e, canvas))
        );

    return zip(mouseDown$, mouseUp$);
}

export const mouseDown$ = (canvas: HTMLCanvasElement, button = 0) =>
{
    return fromEvent(canvas, 'mousedown')
        .pipe(
            filter(e => (e as MouseEvent).button === button),
            map(e => transformEvent(e, canvas)));
}

export const mouseUp$ =  (canvas: HTMLCanvasElement, button = 0) =>
{
    return fromEvent(canvas, 'mouseup')
        .pipe(
            filter(e => (e as MouseEvent).button === button),
            map(e => transformEvent(e, canvas)));
}

export const mouseMove$ =  (canvas: HTMLCanvasElement) =>
{
    return fromEvent(canvas, 'mouseup')
        .pipe(map(e => transformEvent(e, canvas)));
}

export const drag$ = (canvas: HTMLCanvasElement, button = 0) =>
{
    const mouseDown$ = fromEvent(canvas, 'mousedown')
        .pipe(
            filter(e => (e as MouseEvent).button === button),
            map(e => transformEvent(e, canvas))
        );

    const mouseUp$ = fromEvent(canvas, 'mouseup')
        .pipe(filter(e => (e as MouseEvent).button === button));

    const mouseMove$ = fromEvent(document, 'mousemove')
        .pipe(
            filter(e => (e as MouseEvent).button === button),
            map(e => transformEvent(e, canvas))
        );

    // Create a timer that emits values every 10 milliseconds
    const timer$ = timer(0, 10);

    // Combine the mouseMove$ and timer$ observables
    const drag$ = combineLatest([mouseMove$, timer$]).pipe(
        map(([event]) => event),
        startWith(null),
    );

    return mouseDown$
        .pipe(
            switchMap(downPos =>
            {
                return drag$.pipe(
                    filter(movePos => movePos !== null),
                    map(movePos =>  movePos!),
                    map(movePos =>
                        {
                            const velocity = vec2.distance(downPos, movePos);
                            const speedVec = vec2.subtract(vec2.create(), downPos, movePos);
                            vec2.normalize(speedVec, speedVec);
                            vec2.scale(speedVec, speedVec, 30 + velocity / 10);

                            return {speed: speedVec,
                                position: vec2.clone(downPos),
                                endPosition: vec2.clone(movePos)};
                        }
                    ))
            }),
            takeUntil(mouseUp$),
            repeat() // Resubscribe to mouseDown$ after drag is completed
        );
}
