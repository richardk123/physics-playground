import {
    MAX_PARTICLE_COUNT,
    GRAVITY,
    POINT_DIAMETER,
    SUB_STEPS,
    MAX_CONSTRAINTS_COUNT,
    SMOOTHING_RADIUS, DAMPING
} from "./Constants";
import {PointsData} from "./Points";
import {createGrid, Grid} from "./Grid";
import {solveFloor} from "./constraint/FloorConstraint";
import {Vec} from "./utils/Vec";
import {ParticleFormations} from "./entitity/ParticleFormation";
import {Color} from "./entitity/Color";
import {calculateDensity, solveFluidConstraint} from "./constraint/FluidConstraint";
import {CollisionCircleConstraintData, solveCollisionCircleConstraint} from "./constraint/CollisionCircleConstraint";
import {measureDuration} from "./utils/TimeUtils";

export interface EngineInfo
{
    simulationDuration: number;
    preSolveDuration: number;
    solveDuration: number;
    postSolveDuration: number;
    pointsCount: number;
    averageDensity: number,
}

export interface Engine
{
    simulate: (dt: number) => void;
    points: PointsData,
    collisionCirclesData: CollisionCircleConstraintData,
    addPoint: (x: number, y: number, mass: number, color: Color) => number;
    addCollisionCircle: (x: number, y: number, radius: number) => number;
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

        const collisionCirclesData: CollisionCircleConstraintData = {
            position: new Float32Array(MAX_CONSTRAINTS_COUNT * 2),
            radius: new Float32Array(MAX_CONSTRAINTS_COUNT),
            count: 0,
        }

        let simulationDuration = 0;
        let preSolveDuration = 0;
        let solveDuration = 0;
        let postSolveDuration = 0;

        let averageDensity = 0;

        let grid: Grid;

        const preSolve = (dt: number) =>
        {
            return measureDuration(() =>
            {
                // najdi delku strany z prepony
                grid = createGrid(points.count, (SMOOTHING_RADIUS / Math.sqrt(2)));

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
            });
        }

        const solve = (dt: number) =>
        {
            return measureDuration(() =>
            {
                for (let i = 0; i < points.count; i++)
                {
                    solveFloor(points, i);
                    solveFluidConstraint(grid, points, i, dt);
                    solveCollisionCircleConstraint(points, i, collisionCirclesData)
                    // solvePointCollision(grid, points, i);
                }
            })
        }

        const postSolve = (dt: number) =>
        {
            return measureDuration(() =>
            {
                const inverseDt = (1 / dt);

                for (let i = 0; i < points.count; i++)
                {
                    // update velocity
                    Vec.setDiff(points.velocity, i, points.positionCurrent, i, points.positionPrevious, i, inverseDt);
                }
            });
        }

        const simulate = (dt: number) =>
        {
            preSolveDuration = 0;
            solveDuration = 0;
            postSolveDuration = 0;

            simulationDuration = measureDuration(() =>
            {
                const ddt = dt / SUB_STEPS;
                for (let i = 0; i < SUB_STEPS; i++)
                {
                    preSolveDuration += preSolve(ddt);
                    solveDuration += solve(ddt);
                    postSolveDuration += postSolve(ddt);
                }
            });
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

        const addCollisionCircle = (x: number, y: number, radius: number) =>
        {
            const index = collisionCirclesData.count;
            collisionCirclesData.position[index * 2 + 0] = x;
            collisionCirclesData.position[index * 2 + 1] = y;
            collisionCirclesData.radius[index] = radius;
            collisionCirclesData.count += 1;
            return index;
        }

        const getEngineInfo = (): EngineInfo =>
        {
            return {
                simulationDuration: simulationDuration,
                postSolveDuration: postSolveDuration,
                solveDuration: solveDuration,
                preSolveDuration: postSolveDuration,
                pointsCount: points.count,
                averageDensity: averageDensity,
            };
        }

        return {
            points: points,
            collisionCirclesData: collisionCirclesData,
            simulate: simulate,
            addPoint: addPoint,
            addCollisionCircle: addCollisionCircle,
            info: getEngineInfo,
        } as Engine;
    }

}