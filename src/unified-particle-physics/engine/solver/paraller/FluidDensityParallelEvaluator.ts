import {FluidConstraintData, FluidSettings} from "../constraint/FluidConstraint";
import {PointsData} from "../data/PointsData";
import {aggregateRangesToBatches, Range} from "../utils/Utils";
import {firstValueFrom, forkJoin, fromEvent, take, tap} from "rxjs";
import {WorkerRequest} from "./FluidDensityParallelWorker";

export class FluidDensityParallelEvaluator
{
    private _workers: Worker[];
    private _numberOfCores: number;

    constructor()
    {
        this._workers = [];
        this._numberOfCores = navigator.hardwareConcurrency - 1;
        for (let i = 0; i < this._numberOfCores; i++)
        {
            const worker = new Worker(new URL("./FluidDensityParallelWorker.ts", import.meta.url));
            this._workers.push(worker);
        }
    }

    public async process(data: FluidConstraintData[],
                         points: PointsData)
    {
        // clear density
        points.density.fill(0);

        const ranges: Range<FluidSettings>[] = data
            .map(d =>
            {
                return {indexFrom: d.indexFrom, indexTo: d.indexTo, value: d.settings};
            });

        const workersResult$ = aggregateRangesToBatches(ranges, this._numberOfCores)
            .map((r, i) =>
            {
                const message: WorkerRequest = {points: points, fluidConstraintData: data, indexesToProcess: r};
                const worker = this._workers[i];

                const message$ = fromEvent<MessageEvent<void>>(worker, 'message')
                    .pipe(take(1));
                worker.postMessage(message);
                return message$;
            });

        await firstValueFrom(forkJoin(workersResult$));
    }
}