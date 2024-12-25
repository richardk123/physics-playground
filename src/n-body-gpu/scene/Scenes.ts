import {Engine} from "../engine/Engine";
import {oneStarScene} from "./OneStarScene";
import {fullParticleScene} from "./FullScene";
import {debugScene} from "./DebugScene";
import {twoParticlesScene} from "./TwoParticlesScene";
import {twoStarsScene} from "./TwoStarsScene";
import {randomShapesScene} from "./RandomShapesScene";

export interface Scene
{
    label: string,
    create: () => Promise<Engine>;
}

export const createScenes = (canvas: HTMLCanvasElement): Scene[] =>
{
    return [
        { label: 'Two stars', create: () => twoStarsScene(canvas)},
        { label: 'One star', create: () => oneStarScene(canvas)},
        { label: 'Random shapes', create: () => randomShapesScene(canvas)},
        { label: 'Full scene', create: () => fullParticleScene(canvas)},
        { label: 'Two particles', create: () => twoParticlesScene(canvas)},
        { label: 'Debug scene', create: () => debugScene(canvas)},
    ];
};