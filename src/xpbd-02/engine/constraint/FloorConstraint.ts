import {PointsData} from "../Points";

export const solveFloor = (points: PointsData, index: number) =>
{
    if (points.positionCurrent[index * 2 + 1] <= 0)
    {
        points.positionCurrent[index * 2 + 1] = 0;
    }
    else if (points.positionCurrent[index * 2 + 1] >= 100)
    {
        points.positionCurrent[index * 2 + 1] = 100;
    }
    if (points.positionCurrent[index * 2] <= -20)
    {
        points.positionCurrent[index * 2] = -20;
    }
    else if (points.positionCurrent[index * 2] >= 120)
    {
        points.positionCurrent[index * 2] = 120;
    }
}