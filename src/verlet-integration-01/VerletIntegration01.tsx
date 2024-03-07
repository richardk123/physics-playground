import {P5Renderer} from "../components/P5Renderer";
import {createEngine} from "./Verlet01";
import {vec2} from "gl-matrix";
import p5Types from "p5";
import {
    combineLatest,
    filter,
    fromEvent,
    map,
    repeat, startWith,
    switchMap,
    takeUntil,
    throttleTime, timer,
} from "rxjs";

export const VerletIntegration01 = () =>
{
    const engine = createEngine();
    let arrowStart: vec2 | null = null;
    let arrowEnd: vec2 | null = null;

    const render = (p5: p5Types) =>
    {
        engine.render(p5);
        renderArrow(p5);
    }
    const transformEvent = (e: Event, canvas: HTMLCanvasElement) =>
    {
        const me = e as MouseEvent;
        return vec2.fromValues(me.x - canvas.offsetLeft, me.y - canvas.offsetTop);
    }

    const createDrag$ = (canvas: HTMLCanvasElement, throtle: number) =>
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
            throttleTime(throtle)
        );

        mouseUp$.subscribe(() =>
        {
            arrowStart = null;
            arrowEnd = null;
        })

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
                                vec2.scale(speedVec, speedVec, 20 + velocity / 10);

                                return {speed: speedVec,
                                    position: vec2.copy(vec2.create(), downPos),
                                    endPosition: vec2.copy(vec2.create(), movePos)};
                            }
                        ))
                }),
                filter(v =>
                {
                    return vec2.len(v.speed) > 25;
                }),
                takeUntil(mouseUp$),
                repeat() // Resubscribe to mouseDown$ after drag is completed
            );
    }

    const emitNewParticlesWithMouse = (canvas: HTMLCanvasElement) =>
    {

        createDrag$(canvas, 0)
            .subscribe(v =>
            {
                arrowStart = vec2.copy(vec2.create(), v.position);
                arrowEnd = vec2.copy(vec2.create(), v.endPosition);
            });

        createDrag$(canvas, 150)
            .subscribe(v =>
            {

                const obj = engine.add(vec2.copy(vec2.create(), v.position));
                engine.setVelocity(obj, v.speed);
            });
    }

    const renderArrow = (p5: p5Types) =>
    {
        if (arrowStart !== null && arrowEnd !== null)
        {
            p5.stroke(255, 50, 50);
            p5.fill(255, 50, 50);
            p5.strokeWeight(10);
            p5.line(arrowStart[0], arrowStart[1], arrowEnd[0], arrowEnd[1]);
        }
    }

    const setup = (p5: p5Types, canvas: HTMLCanvasElement) =>
    {
        emitNewParticlesWithMouse(canvas);
    }

    return <>
        <P5Renderer render={render} setup={setup}/>
    </>
}