export interface Color
{
    r: number,
    g: number,
    b: number,
}

export class Colors
{
    static green = (): Color =>
    {
        return {r: 25, g: 255, b: 25}
    }

    static blue = (): Color =>
    {
        return {r: 25, g: 25, b: 200}
    }

    static pink = (): Color =>
    {
        return {r: 255, g: 192,b: 203}
    }

    static darkYellow = (): Color =>
    {
        return {r: 139, g: 128, b: 0};
    }
}