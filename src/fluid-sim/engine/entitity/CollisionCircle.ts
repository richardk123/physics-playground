import {Engine} from "../Engine";

export class CollisionCircle
{
    private _index: number;
    private _engine: Engine;

    constructor(engine: Engine, x: number, y: number, radius: number)
    {
        this._engine = engine;
        this._index = engine.addCollisionCircle(x, y, radius);
    }


    setPosition(x: number, y: number)
    {
        this._engine.collisionCirclesData.position[this._index * 2 + 0] = x;
        this._engine.collisionCirclesData.position[this._index * 2 + 1] = y;
    }

    rotate(angle: number): void
    {
    }

    setVelocity(x: number, y: number): void
    {
    }

}