import {Renderer} from "../components/Renderer";
import {createEngine} from "./Verlet01";
import {vec2} from "gl-matrix";
import p5Types from "p5";

export const VerletIntegration01 = () =>
{
    const engine = createEngine();
    engine.add(vec2.fromValues(450, 250), vec2.create());
    // engine.add(vec2.fromValues(700, 500), vec2.create());

    const render = (p5: p5Types) =>
    {
        engine.render(p5);
    }
    return <>
        <Renderer render={render}/>
    </>
}