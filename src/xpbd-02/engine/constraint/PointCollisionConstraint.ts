import {POINT_DIAMETER} from "../../../xpdb/engine/PhysicsConstants";
import {Grid} from "../Grid";
import {PointsData} from "../Points";
import {Vec} from "../Vec";
import {vec2} from "gl-matrix";

export const solvePointCollision = (grid: Grid, points: PointsData, index: number) =>
{
    const x1 = points.x[index];
    const y1 = points.y[index];

    const surrounding = grid.getInSurroundingCells(x1, y1);

    surrounding.forEach(index2 =>
    {
        const x2 = points.x[index2];
        const y2 = points.y[index2];

        const distance = Vec.dist(x1, y1, x2, y2);

        if (distance < POINT_DIAMETER)
        {
            const v = vec2.sub(vec2.create(), vec2.fromValues(x1, y1), vec2.fromValues(x2, y2));
            vec2.normalize(v, v);

            const moveDist = (POINT_DIAMETER - distance) / 2;
            vec2.scale(v, v, moveDist);

            points.x[index] = points.x[index] + v[0];
            points.y[index] = points.y[index] + v[1];

            points.x[index2] = points.x[index2] - v[0];
            points.y[index2] = points.y[index2] - v[1];
        }
    });
}