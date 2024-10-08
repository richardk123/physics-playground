import {PointsData} from "../Points";
import {FRICTION} from "../Constants";

export const WORLD_MIN_X = 0;
export const WORLD_MAX_X = 100;

export const WORLD_MIN_Y = 0;
export const WORLD_MAX_Y = 100;

export const solveFloor = (points: PointsData, index: number) =>
{
    // TODO: fix friction
    if (points.positionCurrent[index * 2 + 1] < WORLD_MIN_Y)
    {
        points.positionCurrent[index * 2 + 1] = WORLD_MIN_Y;

        const diffX = (points.positionCurrent[index * 2] - points.positionPrevious[index * 2]) * FRICTION;
        points.positionCurrent[index * 2] = points.positionCurrent[index * 2] - diffX;
    }
    else if (points.positionCurrent[index * 2 + 1] > WORLD_MAX_Y)
    {
        points.positionCurrent[index * 2 + 1] = WORLD_MAX_Y;

        const diffX = (points.positionCurrent[index * 2] - points.positionPrevious[index * 2]) * FRICTION;
        points.positionCurrent[index * 2] = points.positionCurrent[index * 2] - diffX;
    }
    if (points.positionCurrent[index * 2] < WORLD_MIN_X)
    {
        points.positionCurrent[index * 2] = WORLD_MIN_X;

        const diffX = (points.positionCurrent[index * 2 + 1] - points.positionPrevious[index * 2 + 1]) * FRICTION;
        points.positionCurrent[index * 2 + 1] = points.positionCurrent[index * 2 + 1] - diffX;
    }
    else if (points.positionCurrent[index * 2] > WORLD_MAX_X)
    {
        points.positionCurrent[index * 2] = WORLD_MAX_X;

        const diffX = (points.positionCurrent[index * 2 + 1] - points.positionPrevious[index * 2 + 1]) * FRICTION;
        points.positionCurrent[index * 2 + 1] = points.positionCurrent[index * 2 + 1] - diffX;
    }
}