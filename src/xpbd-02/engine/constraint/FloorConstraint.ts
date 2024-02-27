import {PointsData} from "../Points";
import {POINT_DIAMETER} from "../Constants";

export const WORLD_MIN_X = -20;
export const WORLD_MAX_X = 120;

export const WORLD_MIN_Y = -POINT_DIAMETER;
export const WORLD_MAX_Y = 100;

export const solveFloor = (points: PointsData, index: number) =>
{
    if (points.positionCurrent[index * 2 + 1] < WORLD_MIN_Y + POINT_DIAMETER)
    {
        points.positionCurrent[index * 2 + 1] = WORLD_MIN_Y + POINT_DIAMETER;
    }
    else if (points.positionCurrent[index * 2 + 1] > WORLD_MAX_Y - POINT_DIAMETER)
    {
        points.positionCurrent[index * 2 + 1] = WORLD_MAX_Y - POINT_DIAMETER;
    }
    if (points.positionCurrent[index * 2] < WORLD_MIN_X + POINT_DIAMETER)
    {
        points.positionCurrent[index * 2] = WORLD_MIN_X + POINT_DIAMETER;
    }
    else if (points.positionCurrent[index * 2] > WORLD_MAX_X - POINT_DIAMETER)
    {
        points.positionCurrent[index * 2] = WORLD_MAX_X - POINT_DIAMETER;
    }
}