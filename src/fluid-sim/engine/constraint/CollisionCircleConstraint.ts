import {PointsData} from "../Points";
import {Vec} from "../utils/Vec";

const vecs = new Float32Array(2);

export interface CollisionCircleConstraintData
{
    position: Float32Array,
    radius: Float32Array,
    count: number,
}

export const solveCollisionCircleConstraint = (points: PointsData, index: number, data: CollisionCircleConstraintData) =>
{
    for (let j= 0; j < data.count; j++)
    {
        const radius = data.radius[j];

        const distanceSquared = Vec.distSquared(data.position, j, points.positionCurrent, index);

        // colliding
        if (distanceSquared < radius * radius)
        {
            const distance = Math.sqrt(distanceSquared);
            Vec.setDiff(vecs, 0, points.positionCurrent, index, data.position, j, 1 / distance);
            Vec.add(points.positionCurrent, index, vecs, 0, radius - distance)
        }
    }
}