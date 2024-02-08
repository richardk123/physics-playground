import {Constraint} from "./Constraint";
import {vec2} from "gl-matrix";
import {PointMass} from "../entity/PointMass";
import {createGrid} from "../../../common/Grid";
import {POINT_DIAMETER} from "../PhysicsConstants";

export interface PointCollisionConstraint extends Constraint
{

}

export const createPointCollisionConstraint = (points: PointMass[]) =>
{
    const solve = (dt: number) =>
    {
        const grid = createGrid<PointMass>(points, POINT_DIAMETER);

        points.forEach(o1 =>
        {
            const surrounding = grid.getInSurroundingCells(o1.position[0], o1.position[1]);

            surrounding.forEach(o2 =>
            {
                const v = vec2.sub(vec2.create(), o1.position, o2.position);
                const distance = vec2.len(v);
                const minDist = POINT_DIAMETER;

                if (distance < minDist)
                {
                    const vNorm = vec2.normalize(vec2.create(), v);
                    const moveDist = (minDist - distance) / 2;
                    const moveVec = vec2.scale(vec2.create(), vNorm, moveDist);

                    vec2.add(o1.position, o1.position, moveVec);
                    vec2.subtract(o2.position, o2.position, moveVec);
                }
            });
        })
    }

    return {
        solve: solve,
        type: "point-collision",
    } as PointCollisionConstraint
}