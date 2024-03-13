import {PointsData} from "./data/PointsData";
import {Vec2d} from "../data/Vec2d";
import {WorldBoundingBoxConstraint} from "./constraint/WorldBoundingBoxConstraint";
import {measureDuration} from "./utils/TimeUtils";
import {
    createFluidGrid,
    FluidConstraintData, FluidSettings,
    setCalculatedPointDensity, solveFluidConstraint,
} from "./constraint/FluidConstraint";
import {Color} from "../data/Color";
import {FluidConstraintParallelEvaluator} from "./paraller/FluidConstraintParallelEvaluator";
import {Vec} from "./utils/Vec";
import {FluidDensityParallelEvaluator} from "./paraller/FluidDensityParallelEvaluator";

export interface SolverSettings
{
    friction: number;
    pointDiameter: number;
    maxParticleCount: number;
    gravity: Vec2d;
    deltaTime: number;
    subStepCount: number;
}
const gravity = new Float32Array(2);

export class Solver
{
    public settings: SolverSettings;
    public points: PointsData;
    public fluidConstraints: FluidConstraintData[];
    public worldBoundingBox = new WorldBoundingBoxConstraint(-Infinity, -Infinity, Infinity, Infinity);
    public simulationDuration = 0;
    private fluidDensityParallelEvaluator = new FluidDensityParallelEvaluator();
    private fluidConstraintParallelEvaluator= new FluidConstraintParallelEvaluator();

    static create(settings: SolverSettings): Solver
    {
        return new Solver(settings);
    }

    private constructor(settings: SolverSettings)
    {
        this.settings = settings;
        this.points = PointsData.create(this.settings.maxParticleCount);
        this.fluidConstraints = [];
    }

    private preSolve(dt: number)
    {
        gravity[0] = Math.sign(this.settings.gravity.x) * Math.pow(this.settings.gravity.x, 2) * dt;
        gravity[1] = Math.sign(this.settings.gravity.y) * Math.pow(this.settings.gravity.y, 2) * dt;

        for (let i = 0; i < this.points.count; i++)
        {
            // apply gravity
            if (this.points.isNotStatic[i] === 1)
            {
                // add gravity
                Vec.add(this.points.velocity, i, gravity, 0)

                // update previous position with current position
                Vec.copy(this.points.positionPrevious, i, this.points.positionCurrent, i);

                // update current position with velocity
                Vec.add(this.points.positionCurrent, i, this.points.velocity, i, dt);
            }
        }
    }

    private async solve(dt: number)
    {
        this.worldBoundingBox.solve(this.settings, this.points);

        await this.fluidDensityParallelEvaluator.process(this.fluidConstraints, this.points);
        await this.fluidConstraintParallelEvaluator.process(this.fluidConstraints, this.points, dt);

        // const fluidGrid = createFluidGrid(this.fluidConstraints, this.points);
        // setCalculatedPointDensity(this.fluidConstraints, fluidGrid, this.points);
        // solveFluidConstraint(this.fluidConstraints, fluidGrid, this.points, dt);
    }

    private postSolve(dt: number)
    {
        const inverseDt = (1 / dt);
        for (let i = 0; i < this.points.count; i++)
        {
            // update velocity
            Vec.setDiff(this.points.velocity, i, this.points.positionCurrent, i, this.points.positionPrevious, i, inverseDt);
        }
    }

    public async simulate()
    {
        const ddt = this.settings.deltaTime / this.settings.subStepCount;
        const t = performance.now();
        for (let i = 0; i < this.settings.subStepCount; i++)
        {
            this.preSolve(ddt);
            await this.solve(ddt);
            this.postSolve(ddt);
        }
        this.simulationDuration = performance.now() - t;
    }

    public addPoint(x: number, y: number, mass: number, color: Color)
    {
        const index = this.points.count;
        this.points.positionCurrent[index * 2 + 0] = x;
        this.points.positionCurrent[index * 2 + 1] = y;
        this.points.massInverse[index] = 1 / mass;
        this.points.color[index * 3 + 0] = color.r;
        this.points.color[index * 3 + 1] = color.g;
        this.points.color[index * 3 + 2] = color.b;
        this.points.count += 1;
        return index;
    }

    public addFluidConstraint(indexFrom: number, indexTo: number, settings: FluidSettings)
    {
        this.fluidConstraints.push({indexFrom: indexFrom, indexTo: indexTo, settings: settings});
        for (let i = indexFrom; i < indexTo; i++)
        {
            this.points.isNotFluid[i] = 0;
        }
    }
}
