import {Solver, SolverSettings} from "./solver/Solver";
import {BoundingBox} from "./data/BoundingBox";
import {Colors} from "./data/Color";


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

    public createRectangle(bottomLeftX: number, bottomLeftY: number, width: number, height: number, mass = 1, color = Colors.blue())
    {
        const pointIndexes: number[] = [];
        for (let y = 0; y < height; y++)
        {
            for (let x = 0; x < width; x++)
            {
                pointIndexes.push(this.solver.addPoint(bottomLeftX + x, bottomLeftY + y, mass, color))
            }
        }
        const indexFrom = pointIndexes[0];
        const indexTo = pointIndexes[pointIndexes.length - 1];

        this.solver.addFluidConstraint(indexFrom, indexTo + 1, {smoothingRadius: 1.2, pressureMultiplier: 50, targetDensity: 1.4})
    }

    private async simulateForever(): Promise<void>
    {
        await this.solver.simulate(); // Your async operation here
        await new Promise(resolve => setTimeout(resolve, 5));
        return this.simulateForever();
    }

    public simulate()
    {
        this.simulateForever().catch(error => {
            console.error("An error occurred:", error);
        });
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