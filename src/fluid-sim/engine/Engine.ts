import {
    MAX_PARTICLE_COUNT,
    GRAVITY,
    POINT_DIAMETER,
    SUB_STEPS,
    MAX_CONSTRAINTS_COUNT,
    SMOOTHING_RADIUS
} from "./Constants";
import {PointsData} from "./Points";
import {createGrid, Grid} from "./Grid";
import {solveFloor} from "./constraint/FloorConstraint";
import {Vec} from "./utils/Vec";
import {ParticleFormations} from "./entitity/ParticleFormation";
import {Color} from "./entitity/Color";
import {calculateDensity, solveFluidConstraint} from "./constraint/FluidConstraint";
import {solvePointCollision} from "./constraint/PointCollisionConstraint";

export interface EngineInfo
{
    duration: number;
    pointsCount: number;
    averageDensity: number,
}

export interface Engine
{
    simulate: (dt: number) => void;
    points: PointsData,
    addPoint: (x: number, y: number, mass: number, color: Color) => number;
    info: () => EngineInfo;
    bodies: () => ParticleFormations;
}

export class Engines
{
    static create = () =>
    {
        const points: PointsData = {
            positionCurrent: new Float32Array(MAX_PARTICLE_COUNT * 2).fill(0),
            positionPrevious: new Float32Array(MAX_PARTICLE_COUNT * 2).fill(0),
            velocity: new Float32Array(MAX_PARTICLE_COUNT * 2).fill(0),
            massInverse: new Float32Array(MAX_PARTICLE_COUNT).fill(0),
            density: new Float32Array(MAX_PARTICLE_COUNT).fill(0),
            isStatic: new Array(MAX_PARTICLE_COUNT).fill(false),
            color: new Float32Array(MAX_PARTICLE_COUNT * 3).fill(0),
            count: 0,
        };

        let duration = 0;
        let averageDensity = 0;

        let grid: Grid;

        const preSolve = (dt: number) =>
        {

            // najdi delku strany z prepony
            grid = createGrid(points.count, SMOOTHING_RADIUS / Math.sqrt(2));

            for (let i = 0; i < points.count; i++)
            {
                // apply gravity
                if (!points.isStatic[i])
                {
                    const g = GRAVITY * dt;
                    points.velocity[i * 2 + 1] = points.velocity[i * 2 + 1] + g;

                    // update previous position with current position
                    Vec.copy(points.positionPrevious, i, points.positionCurrent, i);

                    // update current position with velocity
                    Vec.add(points.positionCurrent, i, points.velocity, i, dt);
                }

                // add point to collision grid
                grid.add(points.positionCurrent[i * 2], points.positionCurrent[i * 2 + 1], i);
            }

            // clear density
            points.density.fill(0);

            for (let i = 0; i < points.count; i++)
            {
                calculateDensity(grid, points, i);
            }
            averageDensity = 0
            for (let i = 0; i < points.count; i++)
            {
                averageDensity += points.density[i];
            }
            averageDensity = averageDensity / points.count;
        }

        const solve = (dt: number) =>
        {
            for (let i = 0; i < points.count; i++)
            {
                solveFloor(points, i);
                solvePointCollision(grid, points, i);
            }
            for (let i = 0; i < points.count; i++)
            {
                solveFluidConstraint(grid, points, i, dt);
            }
        }

        const postSolve = (dt: number) =>
        {
            // const inverseDt = (1 / dt);
            //
            // for (let i = 0; i < points.count; i++)
            // {
            //     // update velocity
            //     Vec.setDiff(points.velocity, i, points.positionCurrent, i, points.positionPrevious, i, inverseDt);
            // }
        }

        const simulate = (dt: number) =>
        {
            const t = performance.now();

            const ddt = dt / SUB_STEPS;
            for (let i = 0; i < SUB_STEPS; i++)
            {
                preSolve(ddt);
                solve(ddt);
                postSolve(ddt);
            }

            duration = performance.now() - t;
        }

        const addPoint = (x: number, y: number, mass: number, color: Color) =>
        {
            const index = points.count;
            points.positionCurrent[index * 2 + 0] = x;
            points.positionCurrent[index * 2 + 1] = y;
            points.massInverse[index] = 1 / mass;
            points.color[index * 3 + 0] = color.r;
            points.color[index * 3 + 1] = color.g;
            points.color[index * 3 + 2] = color.b;
            points.count += 1;
            return index;
        }

        const getEngineInfo = (): EngineInfo =>
        {
            return {
                duration: duration,
                pointsCount: points.count,
                averageDensity: averageDensity,
            };
        }

        return {
            points: points,
            simulate: simulate,
            addPoint: addPoint,
            info: getEngineInfo,
        } as Engine;
    }

}