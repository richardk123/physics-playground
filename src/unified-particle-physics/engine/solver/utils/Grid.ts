export interface Grid
{
    add: (x: number, y: number, index: number) => void;
    getInCell: (x: number, y: number) => number[];
    getInSurroundingCells: (x: number, y: number) => number[];
    getData: () => GridData;
}

export interface GridData
{
    spacing: number;
    width: number;
    data: Map<number, number[]>;
}

export class Grids implements Grid
{
    private spacing: number;
    private width: number;
    public data: Map<number, number[]>;

    private constructor(width: number, spacing: number, data: Map<number, number[]>)
    {
        this.width = width;
        this.spacing = spacing;
        this.data = data;
    }

    public static create(width: number, spacing: number): Grid
    {
        return new Grids(width, spacing,  new Map());
    }

    public static createFromMap(width: number, spacing: number, data: Map<number, number[]>): Grid
    {
        return new Grids(width, spacing, data);
    }

    private getKey(x: number, y: number)
    {
        const xi = Math.floor(x / this.spacing);
        const yi = Math.floor(y / this.spacing);
        return xi * this.width + yi;
    }

    public add(x: number, y: number, index: number)
    {
        const key = this.getKey(x, y);

        if (!this.data.has(key)) {
            this.data.set(key, []);
        }
        this.data.get(key)!.push(index);
    }

    public getInCell(x: number, y: number): number[]
    {
        const key = this.getKey(x, y);
        return this.data.get(key) || [];
    }

    public getInSurroundingCells(x: number, y: number): number[]
    {
        const result = [];
        const s = this.spacing;

        result.push(...this.getInCell(x - s, y - s));
        result.push(...this.getInCell(x - 0, y - s));
        result.push(...this.getInCell(x + s, y - s));

        result.push(...this.getInCell(x - s, y - 0));
        result.push(...this.getInCell(x - 0, y - 0));
        result.push(...this.getInCell(x + s, y - 0));

        result.push(...this.getInCell(x - s, y + s));
        result.push(...this.getInCell(x - 0, y + s));
        result.push(...this.getInCell(x + s, y + s));

        return result;
    }

    public getData(): GridData
    {
        return {width: this.width, spacing: this.spacing, data: this.data};
    }
}

export interface ColumnsData
{
    spacing: number;
    data: Map<number, number[]>;
}

export class Columns
{
    private spacing: number;
    public data: Map<number, number[]>;

    private constructor(spacing: number, data: Map<number, number[]>)
    {
        this.spacing = spacing;
        this.data = data;
    }

    public static create(spacing: number): Columns
    {
        return new Columns(spacing, new Map());
    }

    public static createFromMap(spacing: number, data: Map<number, number[]>)
    {
        return new Columns(spacing, data);
    }

    private getKey(x: number)
    {
        return Math.floor(x / this.spacing);
    }

    public add(x: number, index: number)
    {
        const key = this.getKey(x);

        if (!this.data.has(key)) {
            this.data.set(key, []);
        }
        this.data.get(key)!.push(index);
    }

    public getData(): ColumnsData
    {
        return {spacing: this.spacing, data: this.data};
    }
}