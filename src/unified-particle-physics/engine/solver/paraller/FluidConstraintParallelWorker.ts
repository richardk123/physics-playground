import {PointsData, PointsDataShared} from "../data/PointsData";
import {GridData, Grids} from "../utils/Grid";
import {createFluidGrid, FluidConstraintData, FluidSettings, solveFluidOnePoint} from "../constraint/FluidConstraint";
import {Range} from "../utils/Utils";

export interface WorkerRequest
{
    points: PointsDataShared;
    fluidConstraintData: FluidConstraintData[];
    indexesToProcess: Range<FluidSettings>[];
    dt: number
}

// eslint-disable-next-line no-restricted-globals
self.onmessage = (e: MessageEvent<WorkerRequest>) =>
{
    try
    {
        const request = e.data;
        const pointsData = PointsData.createFromSharedBuffers(request.points);
        const grid = createFluidGrid(request.fluidConstraintData, pointsData);

        request.indexesToProcess.forEach(itp =>
        {
            const indexFrom = itp.indexFrom;
            const indexTo = itp.indexTo;

            for (let i = indexFrom; i < indexTo; i++)
            {
                solveFluidOnePoint(grid, pointsData, itp.value, i, request.dt);
            }
        })
    }
    catch (e)
    {
        console.log(e);
    }

    // eslint-disable-next-line no-restricted-globals
    self.postMessage(0);
};

export {};