import {Engine} from "../engine/Engine";
import {randomParticlesScene} from "./RandomParticlesScene";
import {fullParticleScene} from "./FullScene";
import {debugScene} from "./DebugScene";
import {twoParticlesScene} from "./TwoParticlesScene";

export interface Scene
{
    label: string,
    create: () => Promise<Engine>;
}

export const createScenes = (canvas: HTMLCanvasElement): Scene[] =>
{
    return [
        { label: 'Random particle', create: () => randomParticlesScene(canvas)},
        { label: 'Full scene', create: () => fullParticleScene(canvas)},
        { label: 'Two particles', create: () => twoParticlesScene(canvas)},
        { label: 'Debug scene', create: () => debugScene(canvas)},
    ];
};