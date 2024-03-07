export class Vec
{
    static scale = (a: Float32Array, anr: number, scale: number) =>
    {
        anr *= 2;
        a[anr++] *= scale;
        a[anr]   *= scale;
    }

    static copy = (a: Float32Array, anr: number, b: Float32Array, bnr: number) =>
    {
        anr *= 2; bnr *= 2;
        a[anr++] = b[bnr++];
        a[anr]   = b[bnr];
    }

    static add = (a: Float32Array, anr: number, b: Float32Array, bnr: number, scale = 1.0) =>
    {
        anr *= 2; bnr *= 2;
        a[anr++] += b[bnr++] * scale;
        a[anr]   += b[bnr] * scale;
    }

    static setDiff = (dst: Float32Array, dnr: number, a: Float32Array, anr: number, b: Float32Array, bnr: number, scale = 1.0) =>
    {
        dnr *= 2; anr *= 2; bnr *= 2;
        dst[dnr++] = (a[anr++] - b[bnr++]) * scale;
        dst[dnr]   = (a[anr] - b[bnr]) * scale;
    }

    static lengthSquared = (a: Float32Array, anr: number) =>
    {
        anr *= 2;
        let a0 = a[anr], a1 = a[anr + 1];
        return a0 * a0 + a1 * a1;
    }

    static distSquared = (a: Float32Array,anr: number, b: Float32Array, bnr: number) =>
    {
        anr *= 2; bnr *= 2;
        let a0 = a[anr] - b[bnr], a1 = a[anr + 1] - b[bnr + 1];
        return a0 * a0 + a1 * a1;
    }

    static dot = (a: Float32Array, anr: number, b: Float32Array, bnr: number) =>
    {
        anr *= 2; bnr *= 2;
        return a[anr] * b[bnr] + a[anr + 1] * b[bnr + 1];
    }

    static setSum = (dst: Float32Array, dnr: number, a: Float32Array, anr: number, b: Float32Array,bnr: number, scale = 1.0) =>
    {
        dnr *= 2; anr *= 2; bnr *= 2;
        dst[dnr++] = (a[anr++] + b[bnr++]) * scale;
        dst[dnr++] = (a[anr++] + b[bnr++]) * scale;
        dst[dnr]   = (a[anr] + b[bnr]) * scale;
    }
}