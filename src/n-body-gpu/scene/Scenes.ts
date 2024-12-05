import {Engine} from "../engine/Engine";
import {randomParticlesScene} from "./RandomParticlesScene";
import {fullParticleScene} from "./FullScene";

export interface Scene
{
    label: string,
    create: () => Promise<Engine>;
}

export const createScenes = (canvas: HTMLCanvasElement): Scene[] =>
{
    return [
        { label: 'Full scene', create: () => fullParticleScene(canvas)},
        { label: 'Random particle', create: () => randomParticlesScene(canvas)},
    ];
};