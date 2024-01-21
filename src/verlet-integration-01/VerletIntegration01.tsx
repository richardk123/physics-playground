import {Renderer} from "../components/Renderer";
import {createEngine} from "./Verlet01";
import {vec2} from "gl-matrix";
import p5Types from "p5";
import {
    audit, auditTime,
    combineLatest,
    filter,
    fromEvent, interval,
    map,
    repeat, startWith,
    switchMap,
    takeUntil,
    throttleTime, timer, withLatestFrom,
} from "rxjs";

export const VerletIntegration01 = () =>
{
    const engine = createEngine();

    const render = (p5: p5Types) =>
    {
        engine.render(p5);
    }
    const transformEvent = (e: Event, canvas: HTMLCanvasElement) =>
    {
        const me = e as MouseEvent;
        return vec2.fromValues(me.x - canvas.offsetLeft, me.y - canvas.offsetTop);
    }

    const emitNewParticlesWithMouse = (canvas: HTMLCanvasElement) =>
    {
        const mouseDown$ = fromEvent(canvas, 'mousedown')
            .pipe(map(e => transformEvent(e, canvas)));

        const mouseUp$ = fromEvent(canvas, 'mouseup');
        const mouseMove$ = fromEvent(document, 'mousemove')
            .pipe(map(e => transformEvent(e, canvas)));

        // Create a timer that emits values every 10 milliseconds
        const timer$ = timer(0, 10);

        // Combine the mouseMove$ and timer$ observables
        const drag$ = combineLatest([mouseMove$, timer$]).pipe(
            map(([event]) => event),
            startWith(null),
            throttleTime(100)
        );

        mouseDown$
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
                            vec2.scale(speedVec, speedVec, 20 + velocity / 10);

                            return {speed: speedVec, position: downPos};
                        }
                    ))
                }),
                filter(v =>
                {
                    return vec2.len(v.speed) > 25;
                }),
                takeUntil(mouseUp$),
                repeat() // Resubscribe to mouseDown$ after drag is completed
            )
            .subscribe(v =>
            {

                const obj = engine.add(vec2.copy(vec2.create(), v.position));
                engine.setVelocity(obj, v.speed);
            })
    }

    const setup = (p5: p5Types, canvas: HTMLCanvasElement) =>
    {
        emitNewParticlesWithMouse(canvas);
    }

    return <>
        <Renderer render={render} setup={setup}/>
    </>
}