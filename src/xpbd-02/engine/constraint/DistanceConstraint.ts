import {vec2} from "gl-matrix";
import {PointsData} from "../Points";

export interface DistanceConstraintData
{
    p1Index: Float32Array,
    p2Index: Float32Array,
    compliance: Float32Array,
    breakThreshold: Float32Array,
    restLength: Float32Array,
    active: Array<boolean>,
    count: number,
}

export const solveDistanceConstraint = (data: DistanceConstraintData,
                                        pointsData: PointsData,
                                        index: number, dt: number) =>
{
    if (data.active[index])
    {
        const compliance = data.compliance[index];
        const restLength = data.restLength[index];
        const p1Index = data.p1Index[index];
        const p2Index = data.p2Index[index];
        const breakThreshold = data.breakThreshold[index];

        const p1Mass = pointsData.mass[p1Index];
        const p2Mass = pointsData.mass[p2Index];

        const alpha = compliance / dt /dt;

        const w1 = 1 / p1Mass;
        const w2 = 1 / p2Mass;
        const w = w1 + w2;

        const x1 = pointsData.x[p1Index];
        const y1 = pointsData.y[p1Index];

        const x2 = pointsData.x[p2Index];
        const y2 = pointsData.y[p2Index];

        const dx = vec2.sub(vec2.create(), vec2.fromValues(x1, y1), vec2.fromValues(x2, y2));
        const length = vec2.len(dx);

        const C = restLength - length;
        const lambda = C / length / (w + alpha);

        if (Math.abs(C) / restLength > breakThreshold)
        {
            data.active[index] = false;
        }

        const moveTo = vec2.scale(vec2.create(), dx, -lambda * w1);

        pointsData.x[p1Index] = pointsData.x[p1Index] - moveTo[0];
        pointsData.y[p1Index] = pointsData.y[p1Index] - moveTo[1];

        pointsData.x[p2Index] = pointsData.x[p2Index] + moveTo[0];
        pointsData.y[p2Index] = pointsData.y[p2Index] + moveTo[1];
    }
}
