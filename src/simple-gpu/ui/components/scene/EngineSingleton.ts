import {Engine} from "../../../engine/Engine";

export class EngineSingleton
{
    private static engine: Engine | undefined;

    public static get(): Engine | undefined
    {
        return this.engine;
    }

    public static set(engine: Engine)
    {
        this.engine = engine;
    }
}