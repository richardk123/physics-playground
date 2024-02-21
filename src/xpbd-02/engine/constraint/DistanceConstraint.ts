import {PointsData} from "../Points";
import {Vec} from "../Vec";

export interface DistanceConstraintData
{
    p1Index: Int32Array,
    p2Index: Int32Array,
    compliance: Float32Array,
    breakThreshold: Float32Array,
    restLengthSqr: Float32Array,
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
        const restLength = Math.sqrt(data.restLengthSqr[index]);
        const p1Index = data.p1Index[index];
        const p2Index = data.p2Index[index];
        const breakThreshold = data.breakThreshold[index];

        const w1 = pointsData.massInverse[p1Index];
        const w2 = pointsData.massInverse[p2Index];

        const alpha = compliance / dt /dt;

        const w = w1 + w2;
        const dx = new Float32Array(2);
        Vec.setDiff(dx, 0, pointsData.positionCurrent, p2Index, pointsData.positionCurrent, p1Index);

        const length = Math.sqrt(Vec.lengthSquared(dx, 0));

        const C = restLength - length;
        const lambda = C / length / (w + alpha);

        if (Math.abs(C) / restLength > breakThreshold)
        {
            data.active[index] = false;
        }

        Vec.add(pointsData.positionCurrent, p1Index, dx, 0, -lambda * w1);
        Vec.add(pointsData.positionCurrent, p2Index, dx, 0, lambda * w2);
    }
}
