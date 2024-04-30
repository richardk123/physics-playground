import {createScene1} from "./Scene1";
import {createScene2} from "./Scene2";
import {createSmallScene} from "./SmallScene";
import {Engine} from "../../../engine/Engine";
import {createSimpleScene} from "./SimpleScene";

export interface Scene
{
    label: string,
    create: () => Promise<Engine>;
}

export const createScenes = (canvas: HTMLCanvasElement): Scene[] =>
{
    return [
        { label: 'Simple scene', create: () => createSimpleScene(canvas)},
        { label: 'Two materials scene', create: () => createScene1(canvas)},
        { label: 'Multiple Colors scene', create: () => createScene2(canvas)},
        { label: 'Small scene', create: () => createSmallScene(canvas)}
    ];
};