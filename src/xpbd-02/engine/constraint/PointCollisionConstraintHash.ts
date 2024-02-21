import {POINT_DIAMETER} from "../../../xpdb/engine/PhysicsConstants";
import {PointsData} from "../Points";
import {Vec} from "../Vec";
import {Hash} from "../common/Hash";

const normal = new Float32Array(2);

export const solvePointCollisionOptimalized = (hash: Hash, points: PointsData, index: number) =>
{
    hash.query(points.positionCurrent, index, POINT_DIAMETER);

    for (var nr = 0; nr < hash.querySize; nr++)
    {
        var index2 = hash.queryIds[nr];

        Vec.setDiff(normal, 0, points.positionCurrent, index, points.positionCurrent, index2);
        const d2 = Vec.lengthSquared(normal, 0);

        if (d2 < POINT_DIAMETER * POINT_DIAMETER && d2 > 0)
        {
            const d = Math.sqrt(d2);
            Vec.scale(normal, 0, 1.0 / d);

            const corr = (POINT_DIAMETER - d) * 0.5;

            Vec.add(points.positionCurrent, index, normal, 0, corr);
            Vec.add(points.positionCurrent, index2, normal, 0, -corr);

            // TODO: does it do anything? velocity at the end is calculated as pos -prevpos
            // reflect velocities along normal
            var vi = Vec.dot(points.velocity, index, normal, 0);
            var vj = Vec.dot(points.velocity, index2, normal, 0);

            Vec.add(points.velocity, index, normal, 0, vj - vi);
            Vec.add(points.velocity, index2, normal, 0, vi - vj);
        }
    }
}