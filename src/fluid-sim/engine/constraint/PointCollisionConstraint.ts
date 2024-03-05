import {POINT_DIAMETER} from "../../../xpdb/engine/PhysicsConstants";
import {Grid} from "../Grid";
import {PointsData} from "../Points";
import {Vec} from "../utils/Vec";
import {FRICTION} from "../Constants";

const normal = new Float32Array(2);
const vecs = new Float32Array(3 * 2);
export const solvePointCollision = (grid: Grid, points: PointsData, index: number) =>
{
    const surrounding = grid.getInSurroundingCells(
        points.positionCurrent[index * 2],
        points.positionCurrent[index * 2 + 1]);

    surrounding.forEach(index2 =>
    {
        Vec.setDiff(normal, 0, points.positionCurrent, index, points.positionCurrent, index2);
        const d2 = Vec.lengthSquared(normal, 0);

        if (d2 < POINT_DIAMETER * POINT_DIAMETER && d2 > 0)
        {
            const d = Math.sqrt(d2);
            Vec.scale(normal, 0, 1.0 / d);

            const corr = (POINT_DIAMETER - d) * 0.5;

            // position correction
            Vec.add(points.positionCurrent, index, normal, 0, corr * (points.isStatic[index] ? 0 : 1));
            Vec.add(points.positionCurrent, index2, normal, 0, -corr * (points.isStatic[index2] ? 0 : 1));

            // velocities
            Vec.setDiff(vecs, 0, points.positionCurrent, index, points.positionPrevious, index);
            Vec.setDiff(vecs, 1, points.positionCurrent, index2, points.positionPrevious, index2);

            // average velocities
            Vec.setSum(vecs, 2, vecs, 0, vecs, 1, 0.5);

            // velocity corrections
            Vec.setDiff(vecs, 0, vecs, 2, vecs, 0);
            Vec.setDiff(vecs, 1, vecs, 2, vecs, 1);

            // add corrections
            const staticCoef = (points.isStatic[index] || points.isStatic[index2]) ? 0 : 1;
            Vec.add(points.positionCurrent, index, vecs, 0, FRICTION * staticCoef);
            Vec.add(points.positionCurrent, index2, vecs, 1, FRICTION * staticCoef);
        }
    });
}