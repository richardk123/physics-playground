import {MAX_PARTICLE_COUNT, GRAVITY, POINT_DIAMETER, SUB_STEPS, MAX_CONSTRAINTS_COUNT} from "./Constants";
import {PointsData} from "./Points";
import {createGrid, Grid} from "./Grid";
import {solvePointCollision} from "./constraint/PointCollisionConstraint";
import {solveFloor} from "./constraint/FloorConstraint";
import {DistanceConstraintData, solveDistanceConstraint} from "./constraint/DistanceConstraint";
import {Vec} from "./utils/Vec";
import {ParticleFormations} from "./entitity/ParticleFormation";
import {Color} from "./entitity/Color";

export interface EngineInfo
{
    duration: number;
    pointsCount: number;
    distanceConstraintCount: number;
}

export interface Engine
{
    simulate: (dt: number) => void;
    points: PointsData,
    distanceConstraints: DistanceConstraintData,
    addPoint: (x: number, y: number, mass: number, color: Color) => number;
    addDistanceConstraint: (p1Index: number, p2Index: number, breakThreshold?: number, compliance?: number) => number;
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
            isStatic: new Array(MAX_PARTICLE_COUNT).fill(false),
            isSlime: new Array(MAX_PARTICLE_COUNT).fill(false),
            color: new Float32Array(MAX_PARTICLE_COUNT * 3).fill(0),
            count: 0,
        };

        const distanceConstraints: DistanceConstraintData = {
            p1Index: new Int32Array(MAX_CONSTRAINTS_COUNT).fill(0),
            p2Index: new Int32Array(MAX_CONSTRAINTS_COUNT).fill(0),
            compliance: new Float32Array(MAX_CONSTRAINTS_COUNT).fill(0),
            breakThreshold: new Float32Array(MAX_CONSTRAINTS_COUNT).fill(0),
            active: new Array(MAX_CONSTRAINTS_COUNT).fill(true),
            restLengthSqr: new Float32Array(MAX_CONSTRAINTS_COUNT).fill(0),
            count: 0,
        };

        let duration = 0;

        // const hash: Hash = new Hash(POINT_DIAMETER, MAX_PARTICLE_COUNT);
        let grid: Grid;

        const preSolve = (dt: number) =>
        {
            grid = createGrid(points.count, POINT_DIAMETER);

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

            // hash.create(points.positionCurrent);
        }

        const solve = (dt: number) =>
        {
            for (let i = 0; i < points.count; i++)
            {
                solvePointCollision(grid, points, i);
                // solvePointCollisionOptimalized(hash, points, i);
                solveFloor(points, i);
            }

            for (let i = 0; i < distanceConstraints.count; i++)
            {
                solveDistanceConstraint(distanceConstraints, points, i, dt);
            }
        }

        const postSolve = (dt: number) =>
        {
            const inverseDt = (1 / dt);

            for (let i = 0; i < points.count; i++)
            {
                // update velocity
                Vec.setDiff(points.velocity, i, points.positionCurrent, i, points.positionPrevious, i, inverseDt);
            }
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

        const addDistanceConstraint = (p1Index: number, p2Index: number, breakThreshold = 0.5, compliance = 0) =>
        {
            const index = distanceConstraints.count;

            distanceConstraints.p1Index[index] = p1Index;
            distanceConstraints.p2Index[index] = p2Index;
            distanceConstraints.breakThreshold[index] = breakThreshold;
            distanceConstraints.compliance[index] = compliance;
            distanceConstraints.restLengthSqr[index] = Vec.distSquared(points.positionCurrent, p1Index, points.positionCurrent, p2Index);
            distanceConstraints.count += 1;

            return index;
        }

        const getEngineInfo = (): EngineInfo =>
        {
            return {
                distanceConstraintCount: distanceConstraints.count,
                duration: duration,
                pointsCount: points.count,
            };
        }

        return {
            points: points,
            distanceConstraints: distanceConstraints,
            simulate: simulate,
            addPoint: addPoint,
            addDistanceConstraint: addDistanceConstraint,
            info: getEngineInfo,
        } as Engine;
    }

}