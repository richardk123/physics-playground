import {Color} from "./Color";

export class Points
{
    public positionCurrent: Float32Array;
    public positionPrevious: Float32Array;
    public velocity: Float32Array;
    public massInverse: Float32Array;
    public color: Float32Array;
    public count: number;

    private constructor(maxParticleCount: number)
    {
        this.positionCurrent = new Float32Array(maxParticleCount * 2);
        this.positionPrevious = new Float32Array(maxParticleCount * 2);
        this.velocity = new Float32Array(maxParticleCount * 2);
        this.massInverse = new Float32Array(maxParticleCount);
        this.color = new Float32Array(maxParticleCount * 3);
        this.count = 0;
    }

    public static create(maxParticleCount: number): Points
    {
        return new Points(maxParticleCount);
    }

    public addPoint(x: number, y: number, mass: number, color: Color)
    {
        const index = this.count;

        this.positionCurrent[index * 2 + 0] = x;
        this.positionCurrent[index * 2 + 1] = y;

        this.massInverse[index] = 1 / mass;

        this.color[index * 3 + 0] = color.r;
        this.color[index * 3 + 1] = color.g;
        this.color[index * 3 + 2] = color.b;

        this.count += 1;

        return index;
    }
}