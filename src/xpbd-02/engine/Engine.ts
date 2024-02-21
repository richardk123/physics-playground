import {MAX_PARTICLE_COUNT, GRAVITY, POINT_DIAMETER, SUB_STEPS, MAX_CONSTRAINTS_COUNT} from "./Constants";
import {PointsData} from "./Points";
import {createGrid, Grid} from "./Grid";
import {solvePointCollision} from "./constraint/PointCollisionConstraint";
import {solveFloor} from "./constraint/FloorConstraint";
import {DistanceConstraintData, solveDistanceConstraint} from "./constraint/DistanceConstraint";
import {Vec} from "./Vec";
import {Bodies} from "./Body";

export interface Engine
{
    simulate: (dt: number) => void;
    points: PointsData,
    distanceConstraints: DistanceConstraintData,
    addPoint: (x: number, y: number, mass?: number) => number;
    addDistanceConstraint: (p1Index: number, p2Index: number, breakThreshold?: number, compliance?: number) => number;
}

export class Engines
{
    static create = () =>
    {
        const points = {
            x: new Float32Array(MAX_PARTICLE_COUNT).fill(0),
            y: new Float32Array(MAX_PARTICLE_COUNT).fill(0),
            prevX: new Float32Array(MAX_PARTICLE_COUNT).fill(0),
            prevY: new Float32Array(MAX_PARTICLE_COUNT).fill(0),
            velocityX: new Float32Array(MAX_PARTICLE_COUNT).fill(0),
            velocityY: new Float32Array(MAX_PARTICLE_COUNT).fill(0),
            mass: new Float32Array(MAX_PARTICLE_COUNT).fill(0),
            isStatic: new Array(MAX_PARTICLE_COUNT).fill(false),
            count: 0,
        } as PointsData;

        const distanceConstraints = {
            p1Index: new Float32Array(MAX_CONSTRAINTS_COUNT).fill(0),
            p2Index: new Float32Array(MAX_CONSTRAINTS_COUNT).fill(0),
            compliance: new Float32Array(MAX_CONSTRAINTS_COUNT).fill(0),
            breakThreshold: new Float32Array(MAX_CONSTRAINTS_COUNT).fill(0),
            active: new Array(MAX_CONSTRAINTS_COUNT).fill(true),
            restLength: new Float32Array(MAX_CONSTRAINTS_COUNT).fill(0),
            count: 0,
        } as DistanceConstraintData;

        let grid: Grid = createGrid(points.count, POINT_DIAMETER);

        const preSolve = (dt: number) =>
        {
            grid = createGrid(points.count, POINT_DIAMETER);

            for (let i = 0; i < points.count; i++)
            {
                // apply gravity
                const g = GRAVITY * dt;
                points.velocityY[i] = points.velocityY[i] + g;

                // update previous position
                points.prevX[i] = points.x[i];
                points.prevY[i] = points.y[i];

                // update current position with velocity
                points.x[i] = points.x[i] + (points.velocityX[i] * dt)
                points.y[i] = points.y[i] + (points.velocityY[i] * dt)

                // add point to collision grid
                grid.add(points.x[i], points.y[i], i);
            }
        }

        const solve = (dt: number) =>
        {
            for (let i = 0; i < points.count; i++)
            {
                solvePointCollision(grid, points, i);
                solveFloor(points, i);
            }

            for (let i = 0; i < distanceConstraints.count; i++)
            {
                solveDistanceConstraint(distanceConstraints, points, i, dt);
            }
        }

        const postSolve = (dt: number) =>
        {
            for (let i = 0; i < points.count; i++)
            {
                // update velocity
                const inverseDt = (1 / dt);
                points.velocityX[i] = (points.x[i] - points.prevX[i]) * inverseDt;
                points.velocityY[i] = (points.y[i] - points.prevY[i]) * inverseDt;
            }
        }

        const simulate = (dt: number) =>
        {
            const ddt = dt / SUB_STEPS;
            for (let i = 0; i < SUB_STEPS; i++)
            {
                preSolve(ddt);
                solve(ddt);
                postSolve(ddt);
            }
        }

        const addPoint = (x: number, y: number, mass = 1) =>
        {
            const index = points.count;
            points.x[index] = x;
            points.y[index] = y;
            points.mass[index] = mass;
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
            distanceConstraints.restLength[index] = Vec.dist(points.x[p1Index], points.y[p1Index], points.x[p2Index], points.y[p2Index]);

            distanceConstraints.count += 1;

            return index;
        }

        return {
            points: points,
            distanceConstraints: distanceConstraints,
            simulate: simulate,
            addPoint: addPoint,
            addDistanceConstraint: addDistanceConstraint,
        } as Engine;
    }

}