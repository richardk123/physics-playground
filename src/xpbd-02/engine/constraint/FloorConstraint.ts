import {PointsData} from "../Points";

export const solveFloor = (points: PointsData, index: number) =>
{
    if (points.y[index] <= 0)
    {
        points.y[index] = 0;
    }
    else if (points.y[index] >= 100)
    {
        points.y[index] = 100;
    }
    if (points.x[index] <= -20)
    {
        points.x[index] = -20;
    }
    else if (points.x[index] >= 120)
    {
        points.x[index] = 120;
    }
}