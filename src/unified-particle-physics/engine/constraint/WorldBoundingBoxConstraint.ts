import {PointsData} from "../data/PointsData";
import {EngineSettings} from "../Engine";

export class WorldBoundingBoxConstraint
{
    public minX: number;
    public minY: number;
    public maxX: number;
    public maxY: number;

    constructor(minX: number, minY: number, maxX: number, maxY: number)
    {
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    }

    public solve(engineSettings: EngineSettings,
                 points: PointsData,
                 index: number): void
    {
        // TODO: fix friction
        if (points.positionCurrent[index * 2 + 1] < this.minY)
        {
            points.positionCurrent[index * 2 + 1] = this.minY;

            const diffX = (points.positionCurrent[index * 2] - points.positionPrevious[index * 2]) * engineSettings.friction;
            points.positionCurrent[index * 2] = points.positionCurrent[index * 2] - diffX;
        }
        else if (points.positionCurrent[index * 2 + 1] > this.maxY)
        {
            points.positionCurrent[index * 2 + 1] = this.maxY;

            const diffX = (points.positionCurrent[index * 2] - points.positionPrevious[index * 2]) * engineSettings.friction;
            points.positionCurrent[index * 2] = points.positionCurrent[index * 2] - diffX;
        }
        if (points.positionCurrent[index * 2] < this.minX)
        {
            points.positionCurrent[index * 2] = this.minX;

            const diffX = (points.positionCurrent[index * 2 + 1] - points.positionPrevious[index * 2 + 1]) * engineSettings.friction;
            points.positionCurrent[index * 2 + 1] = points.positionCurrent[index * 2 + 1] - diffX;
        }
        else if (points.positionCurrent[index * 2] > this.maxX)
        {
            points.positionCurrent[index * 2] = this.maxX;

            const diffX = (points.positionCurrent[index * 2 + 1] - points.positionPrevious[index * 2 + 1]) * engineSettings.friction;
            points.positionCurrent[index * 2 + 1] = points.positionCurrent[index * 2 + 1] - diffX;
        }
    }

}