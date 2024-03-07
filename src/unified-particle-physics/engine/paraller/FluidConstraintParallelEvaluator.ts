// export class FluidConstraintParallelEvaluator
// {
//     private _workers: Worker[];
//
//     constructor()
//     {
//         this._workers = [];
//         const numberOfCores = navigator.hardwareConcurrency;
//         for (let i = 0; i < numberOfCores - 1; i++)
//         {
//             this._workers.push(new Worker(new URL("./FluidConstraintParallelWorker.ts", import.meta.url)))
//         }
//     }
//
//     public process()
//     {
//         this._workers
//             .map(w => w.postMessage())
//     }
// }
export interface AAA
{

}