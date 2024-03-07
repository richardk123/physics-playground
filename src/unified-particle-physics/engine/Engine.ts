import {Solver, SolverSettings} from "./solver/Solver";
import {BoundingBox} from "./data/BoundingBox";


export class Engine
{
    private static DEFAULT_SETTINGS: SolverSettings = {
        friction: 0,
        pointDiameter: 1,
        gravity: {x: 0, y: -10},
        maxParticleCount: 10000,
        deltaTime: 1 / 60,
        subStepCount: 4,
    };

    public solver: Solver;

    static create(solverSettings: SolverSettings = Engine.DEFAULT_SETTINGS)
    {
        return new Engine(solverSettings);
    }

    private constructor(solverSettings: SolverSettings)
    {
        this.solver = Solver.create(solverSettings);
    }

    public simulate()
    {
        this.solver.simulate();
    }

    public getWorldBoundingBox = (): BoundingBox =>
    {
        return {
            bottomLeft: {x: this.solver.worldBoundingBox.minX, y: this.solver.worldBoundingBox.minY},
            topRight: {x: this.solver.worldBoundingBox.maxX, y: this.solver.worldBoundingBox.maxY},
        }
    };

    public setWorldBoundingBox(rectangle: BoundingBox)
    {
        this.solver.worldBoundingBox.minX = rectangle.bottomLeft.x;
        this.solver.worldBoundingBox.minY = rectangle.bottomLeft.y;
        this.solver.worldBoundingBox.maxX = rectangle.topRight.x;
        this.solver.worldBoundingBox.maxY = rectangle.topRight.y;
    }

    public getSettings(): SolverSettings
    {
        return {...this.solver.settings};
    }

    public setSettings(settings: SolverSettings)
    {
        this.solver.settings = settings;
    }

}