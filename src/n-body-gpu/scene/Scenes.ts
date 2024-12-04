import {Engine} from "../engine/Engine";
import {randomParticlesScene} from "./RandomParticlesScene";

export interface Scene
{
    label: string,
    create: () => Promise<Engine>;
}

export const createScenes = (canvas: HTMLCanvasElement): Scene[] =>
{
    return [
        { label: 'Random particle', create: () => randomParticlesScene(canvas)},
    ];
};