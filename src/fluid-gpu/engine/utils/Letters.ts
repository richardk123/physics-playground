import {Engine} from "../Engine";
import {Color} from "../data/Color";

export class Letters
{
    private engine: Engine;

    constructor(engine: Engine)
    {
        this.engine = engine;
    }

    public A(x: number,
             y: number,
             color: Color,
             material: number,
             size = 1 )
    {
        const shrink = 1.02;

        this.engine.createRectangleRandom(x, y, size, 4 * size, 1, color, material, shrink);
        this.engine.createRectangleRandom(x + 3 * size, y, size, 4 * size, 1, color, material, shrink);

        this.engine.createRectangleRandom(x + 1 * size,
            y + 2 * size,
            2 * size,
            1 * size,
            1, color, material, shrink);

        this.engine.createRectangleRandom(x + 1 * size,
            y + 4 * size,
            2 * size,
            1 * size,
            1, color, material, shrink);
    }

    public B(x: number,
             y: number,
             color: Color,
             material: number,
             size = 1 )
    {
        const shrink = 1.02;

        this.engine.createRectangleRandom(x, y, size, 5 * size, 1, color, material, shrink);
        this.engine.createRectangleRandom(x + 3 * size, y + 1 * size, size, 3 * size, 1, color, material, shrink);

        this.engine.createRectangleRandom(x + 1 * size,
            y,
            2 * size,
            1 * size,
            1, color, material, shrink);

        this.engine.createRectangleRandom(x + 1 * size,
            y + 2 * size,
            2 * size,
            1 * size,
            1, color, material, shrink);

        this.engine.createRectangleRandom(x + 1 * size,
            y + 4 * size,
            2 * size,
            1 * size,
            1, color, material, shrink);
    }

}