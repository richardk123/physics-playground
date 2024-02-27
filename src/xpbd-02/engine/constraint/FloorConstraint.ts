import {PointsData} from "../Points";
import {FRICTION, POINT_DIAMETER} from "../Constants";

export const WORLD_MIN_X = -20;
export const WORLD_MAX_X = 120;

export const WORLD_MIN_Y = -POINT_DIAMETER;
export const WORLD_MAX_Y = 100;

export const solveFloor = (points: PointsData, index: number) =>
{
    // TODO: fix friction
    if (points.positionCurrent[index * 2 + 1] < WORLD_MIN_Y + POINT_DIAMETER)
    {
        points.positionCurrent[index * 2 + 1] = WORLD_MIN_Y + POINT_DIAMETER;

        const diffX = (points.positionCurrent[index * 2] - points.positionPrevious[index * 2]) * FRICTION;
        points.positionCurrent[index * 2] = points.positionCurrent[index * 2] - diffX;
    }
    else if (points.positionCurrent[index * 2 + 1] > WORLD_MAX_Y - POINT_DIAMETER)
    {
        points.positionCurrent[index * 2 + 1] = WORLD_MAX_Y - POINT_DIAMETER;

        const diffX = (points.positionCurrent[index * 2] - points.positionPrevious[index * 2]) * FRICTION;
        points.positionCurrent[index * 2] = points.positionCurrent[index * 2] - diffX;
    }
    if (points.positionCurrent[index * 2] < WORLD_MIN_X + POINT_DIAMETER)
    {
        points.positionCurrent[index * 2] = WORLD_MIN_X + POINT_DIAMETER;

        const diffX = (points.positionCurrent[index * 2 + 1] - points.positionPrevious[index * 2 + 1]) * FRICTION;
        points.positionCurrent[index * 2 + 1] = points.positionCurrent[index * 2 + 1] - diffX;
    }
    else if (points.positionCurrent[index * 2] > WORLD_MAX_X - POINT_DIAMETER)
    {
        points.positionCurrent[index * 2] = WORLD_MAX_X - POINT_DIAMETER;

        const diffX = (points.positionCurrent[index * 2 + 1] - points.positionPrevious[index * 2 + 1]) * FRICTION;
        points.positionCurrent[index * 2 + 1] = points.positionCurrent[index * 2 + 1] - diffX;
    }
}