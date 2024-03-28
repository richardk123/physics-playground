import {combineLatest, filter, fromEvent, map, repeat, startWith, switchMap, takeUntil, timer} from "rxjs";
import {vec2} from "gl-matrix";
import {Vec2d} from "../../../engine/data/Vec2d";
import {Camera} from "../../../engine/data/Camera";
import {Transformer} from "../../../engine/common/Transformer";

const transformEvent = (e: Event, canvas: HTMLCanvasElement) =>
{
    const me = e as MouseEvent;
    return vec2.fromValues(me.x - canvas.offsetLeft, me.y - canvas.offsetTop);
}

export const registerScrolling = (canvas: HTMLCanvasElement, camera: Camera) =>
{
    scroll$(canvas)
        .subscribe(e =>
        {
            const transform = new Transformer(camera, canvas);
            const deltaZoom = (e.deltaY * 0.01);
            const pCurrent = transform.toWorldSpace().position(e.mouse[0], e.mouse[1]);
            camera.zoom +=  camera.zoom * deltaZoom;
            const pZoomed = transform.toWorldSpace().position(e.mouse[0], e.mouse[1]);

            camera.translation.x += pCurrent.x - pZoomed.x;
            camera.translation.y += pCurrent.y - pZoomed.y;
        })
}

export const registerMoving = (canvas: HTMLCanvasElement, camera: Camera) =>
{
    const cameraTranslation = () =>
    {
        return {x: camera.translation.x, y: camera.translation.y};
    }

    dragAndDrop$(canvas, cameraTranslation, 0)
        .subscribe((val) =>
        {
            const transform = new Transformer(camera, canvas);

            const moveX =  val.position[0] - val.endPosition[0];
            const moveY =  val.endPosition[1] - val.position[1];

            console.log(val.originalPosition.x);
            camera.translation.x = val.originalPosition.x + transform.toWorldSpace().size(moveX);
            camera.translation.y = val.originalPosition.y + transform.toWorldSpace().size(moveY);
        });
}

export const scroll$ = (canvas: HTMLCanvasElement) =>
{
    return fromEvent<WheelEvent>(canvas, 'wheel').pipe(
        map(event =>
        {
            event.preventDefault();
            event.stopPropagation();
            return {deltaY: event.deltaY, mouse: transformEvent(event, canvas)};
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