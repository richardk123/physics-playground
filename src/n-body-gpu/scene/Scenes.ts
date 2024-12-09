import {Engine} from "../engine/Engine";
import {randomParticlesScene} from "./RandomParticlesScene";
import {fullParticleScene} from "./FullScene";
import {debugScene} from "./DebugScene";

export interface Scene
{
    label: string,
    create: () => Promise<Engine>;
}

export const createScenes = (canvas: HTMLCanvasElement): Scene[] =>
{
    return [
        { label: 'Two particles', create: () => debugScene(canvas)},
        { label: 'Random particle', create: () => randomParticlesScene(canvas)},
        { label: 'Full scene', create: () => fullParticleScene(canvas)},
    ];
};