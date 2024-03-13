import {Grid, Grids} from "../utils/Grid";
import {PointsData} from "../data/PointsData";
import {Vec} from "../utils/Vec";
import {SolverSettings} from "../Solver";

export class PointCollisionConstraint
{
    private normal= new Float32Array(2);
    private vecs = new Float32Array(3 * 2);
    
    public solve(es: SolverSettings,
                 points: PointsData,
                 indexFrom: number,
                 indexTo: number)
    {
        const grid = Grids.create(points.count, es.pointDiameter);

        for (let i = indexFrom; i < indexTo; i++)
        {
            this.solveOneIndex(es, grid, points, i);
        }
    }

    private solveOneIndex(es: SolverSettings,
                          grid: Grid,
                          points: PointsData,
                          index: number)
    {

        const surrounding = grid.getInSurroundingCells(
            points.positionCurrent[index * 2],
            points.positionCurrent[index * 2 + 1]);

        surrounding.forEach(index2 =>
        {
            Vec.setDiff(this.normal, 0, points.positionCurrent, index, points.positionCurrent, index2);
            const d2 = Vec.lengthSquared(this.normal, 0);

            if (d2 < es.pointDiameter * es.pointDiameter && d2 > 0)
            {
                const d = Math.sqrt(d2);
                Vec.scale(this.normal, 0, 1.0 / d);

                const corr = (es.pointDiameter - d) * 0.5;

                // todo will it work?
                const bothFluid = points.isNotFluid[index] || points.isNotFluid[index2];
                // position correction
                Vec.add(points.positionCurrent, index, this.normal, 0, corr * points.isNotStatic[index] && bothFluid);
                Vec.add(points.positionCurrent, index2, this.normal, 0, -corr * points.isNotStatic[index2] && bothFluid);

                // velocities
                Vec.setDiff(this.vecs, 0, points.positionCurrent, index, points.positionPrevious, index);
                Vec.setDiff(this.vecs, 1, points.positionCurrent, index2, points.positionPrevious, index2);

                // average velocities
                Vec.setSum(this.vecs, 2, this.vecs, 0, this.vecs, 1, 0.5);

                // velocity corrections
                Vec.setDiff(this.vecs, 0, this.vecs, 2, this.vecs, 0);
                Vec.setDiff(this.vecs, 1, this.vecs, 2, this.vecs, 1);

                // add corrections
                const staticCoef = points.isNotStatic[index] || points.isNotStatic[index2];
                Vec.add(points.positionCurrent, index, this.vecs, 0, es.friction * staticCoef && bothFluid);
                Vec.add(points.positionCurrent, index2, this.vecs, 1, es.friction * staticCoef ** bothFluid);
            }
        });
    }
}