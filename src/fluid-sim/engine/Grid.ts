export interface Grid
{
    add: (x: number, y: number, index: number) => void;
    getInCell: (x: number, y: number) => number[];
    getInSurroundingCells: (x: number, y: number) => number[];
}

export const createGrid = (width: number, spacing: number) =>
{
    const data: Map<number, number[]> = new Map();

    const getKey = (x: number, y: number) =>
    {
        const xi = Math.floor(x / spacing);
        const yi = Math.floor(y / spacing);
        return xi * width + yi;
    }

    const add = (x: number, y: number, index: number) =>
    {
        const key = getKey(x, y);

        if (!data.has(key)) {
            data.set(key, []);
        }
        data.get(key)!.push(index);
    }

    const getInCell = (x: number, y: number): number[] =>
    {
        const key = getKey(x, y);
        return data.get(key) || [];
    }

    const getInSurroundingCells = (x: number, y: number): number[] =>
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


    return {
        add: add,
        getInCell: getInCell,
        getInSurroundingCells: getInSurroundingCells
    } as Grid;
}