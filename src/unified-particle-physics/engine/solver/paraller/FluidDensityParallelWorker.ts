import {PointsData, PointsDataShared} from "../data/PointsData";
import {GridData, Grids} from "../utils/Grid";
import {FluidSettings, setCalculatedPointDensityForOnePoint, solveFluidOnePoint} from "../constraint/FluidConstraint";
import {Range} from "../utils/Utils";

export interface WorkerRequest
{
    points: PointsDataShared;
    gridData: GridData;
    indexesToProcess: Range<FluidSettings>[];
}

// eslint-disable-next-line no-restricted-globals
self.onmessage = (e: MessageEvent<WorkerRequest>) =>
{
    try
    {
        const request = e.data;
        const pointsData = PointsData.createFromSharedBuffers(request.points);
        const grid = Grids.createFromMap(request.gridData.width, request.gridData.spacing, request.gridData.data);

        request.indexesToProcess.forEach(itp =>
        {
            const indexFrom = itp.indexFrom;
            const indexTo = itp.indexTo;

            for (let i = indexFrom; i < indexTo; i++)
            {
                setCalculatedPointDensityForOnePoint(grid, itp.value, pointsData, i);
            }
        })
    }
    catch (e)
    {
        console.log(e);
    }

    // eslint-disable-next-line no-restricted-globals
    self.postMessage("fluid density parallel worker success");
};

export {};