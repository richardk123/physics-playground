import {vec2} from "gl-matrix";

export const findGeometricCenter = (points: Float32Array, indexFrom: number, indexTo: number) =>
{
    let sumX = 0;
    let sumY = 0;
    const count = indexTo - indexFrom;
    for (let i = indexFrom; i < indexTo; i++)
    {
        const x = points[i * 2 + 0];
        const y = points[i * 2 + 1];
        sumX += x;
        sumY += y;
    }
    return vec2.fromValues(sumX / count, sumY / count);
}

// Function to calculate the area of a 2D polygon using shoelace formula
export const calculateArea = (points: Float32Array, indexFrom: number, indexTo: number): number  =>
{
    let area = 0;

    const calcArea = (i: number, j: number) =>
    {
        const p1x = points[i * 2 + 0];
        const p1y = points[i * 2 + 1];
        const p2x = points[j * 2 + 0];
        const p2y = points[j * 2 + 1];

        return p1x * p2y - p2x * p1y;
    }

    for (let i = indexFrom; i < indexTo; i++)
    {
        area += calcArea(i, (i + 1));
    }
    area += calcArea(0, indexTo);

    return Math.abs(area) / 2;
}
