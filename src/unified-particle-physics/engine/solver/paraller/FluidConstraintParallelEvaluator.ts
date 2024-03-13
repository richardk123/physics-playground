import {Grid} from "../utils/Grid";
import {PointsData} from "../data/PointsData";
import {FluidConstraintData, FluidSettings} from "../constraint/FluidConstraint";
import {WorkerRequest} from "./FluidConstraintParallelWorker";
import {Range} from "../utils/Utils";
import {firstValueFrom, forkJoin, fromEvent, Observable, take} from "rxjs";

export class FluidConstraintParallelEvaluator
{
    private _workers: Worker[];

    constructor()
    {
        this._workers = [];
        const numberOfCores = 1;
        for (let i = 0; i < numberOfCores; i++)
        {
            const worker = new Worker(new URL("./FluidConstraintParallelWorker.ts", import.meta.url));
            this._workers.push(worker);
        }
    }

    public async process(data: FluidConstraintData[],
                         grid: Grid,
                         points: PointsData,
                         dt: number)
    {
        Array.from(Array(10).keys())

        const workersResult = data.map((d, i) =>
        {
            const indexesToProcess: Range<FluidSettings>[] = [{indexFrom: d.indexFrom, indexTo: d.indexTo, value: d.settings}];
            const message: WorkerRequest = {points: points, gridData: grid.getData(), indexesToProcess: indexesToProcess, dt: dt}
            const worker = this._workers[i];

            const message$ = fromEvent<MessageEvent<void>>(worker, 'message').pipe(take(1));
            worker.postMessage(message);
            return message$;
        });

        await firstValueFrom(forkJoin(workersResult));
    }
}