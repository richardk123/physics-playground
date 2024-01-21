import {Renderer} from "../components/Renderer";
import {createEngine} from "./Verlet01";
import {vec2} from "gl-matrix";
import p5Types from "p5";
import {combineLatest, fromEvent, map, merge, switchMap, takeUntil, throttleTime, withLatestFrom, zip} from "rxjs";
import {Simulate} from "react-dom/test-utils";

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
        const mouseMove$ = mouseDown$
            .pipe(switchMap(() => fromEvent(document, 'mousemove').pipe(takeUntil(mouseUp$))))
            .pipe(map(e => transformEvent(e, canvas)));

        combineLatest([mouseDown$, mouseMove$])
            .pipe(throttleTime(100))
            .subscribe(e =>
            {
                const downPos = e[0];
                const movePos = e[1];
                const velocity = vec2.distance(downPos, movePos);
                const speedVec = vec2.subtract(vec2.create(), downPos, movePos);
                vec2.normalize(speedVec, speedVec);
                vec2.scale(speedVec, speedVec, velocity / 10);

                const obj = engine.add(vec2.copy(vec2.create(), downPos));
                engine.setVelocity(obj, speedVec);
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