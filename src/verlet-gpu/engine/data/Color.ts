export interface Color
{
    r: number,
    g: number,
    b: number,
    a: number,
}

export class Colors
{
    static green = (): Color =>
    {
        return {r: 0.1, g: 1.0, b: 0.1, a: 1.0}
    }

    static blue = (): Color =>
    {
        return {r: 0.1, g: 0.1, b: 0.9, a: 1.0}
    }

}