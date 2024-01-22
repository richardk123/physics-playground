import {vec2} from "gl-matrix";

interface Particle
{
    position: vec2;
}

interface Grid<T extends Particle>
{
    add: (particle: T) => void;
    getInCell: (x: number, y: number) => T[];
    getInSurroundingCells: (x: number, y: number) => T[];
}

export const createGrid = <T extends Particle>(particles: T[], spacing: number) =>
{
    const data: Map<number, T[]> = new Map();
    const width = particles.length;

    const getKey = (x: number, y: number) =>
    {
        const xi = Math.floor(x / spacing);
        const yi = Math.floor(y / spacing);
        return xi * width + yi;
    }

    const add = (p: T) =>
    {
        const key = getKey(p.position[0], p.position[1]);

        if (!data.has(key)) {
            data.set(key, []);
        }
        data.get(key)!.push(p);
    }

    const getInCell = (x: number, y: number): Particle[] =>
    {
        const key = getKey(x, y);
        return data.get(key) || [];
    }

    const getInSurroundingCells = (x: number, y: number): Particle[] =>
    {
        const result = [];
        const s = spacing;

        result.push(...getInCell(x - s, y - s));
        result.push(...getInCell(x - 0, y - s));
        result.push(...getInCell(x + s, y - s));

        result.push(...getInCell(x - s, y - 0));
        result.push(...getInCell(x - 0, y - 0));
        result.push(...getInCell(x + s, y - 0));

        result.push(...getInCell(x - s, y + s));
        result.push(...getInCell(x - 0, y + s));
        result.push(...getInCell(x + s, y + s));

        return result;
    }

    // add particles
    particles.forEach(p => add(p));

    return {
        add: add,
        getInCell: getInCell,
        getInSurroundingCells: getInSurroundingCells
    } as Grid<T>;
}