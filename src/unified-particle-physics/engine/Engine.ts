import {PointsData} from "./data/PointsData";
import {Vec2d} from "./data/Vec2d";
import {WorldBoundingBoxConstraint} from "./constraint/WorldBoundingBoxConstraint";
import {Vec} from "../../fluid-sim/engine/utils/Vec";
import {measureDuration} from "./utils/TimeUtils";

const DEFAULT_SETTINGS = {
    friction: 0,
    pointDiameter: 1,
    gravity: {x: 0, y: -10},
    maxParticleCount: 10000,
    deltaTime: 1 / 6,
    subStepCount: 4,
} as EngineSettings;

export interface EngineSettings
{
    friction: number;
    pointDiameter: number;
    maxParticleCount: number;
    gravity: Vec2d;
    deltaTime: number;
    subStepCount: number;
}

export class Engine
{
    public settings: EngineSettings;
    public points: PointsData;
    private worldBoundingBox = new WorldBoundingBoxConstraint(-Infinity, -Infinity, Infinity, Infinity);
    public simulationDuration = 0;

    constructor(settings: EngineSettings = DEFAULT_SETTINGS)
    {
        this.settings = settings;

        this.points = {
            positionCurrent: new Float32Array(this.settings.maxParticleCount * 2).fill(0),
            positionPrevious: new Float32Array(this.settings.maxParticleCount * 2).fill(0),
            velocity: new Float32Array(this.settings.maxParticleCount * 2).fill(0),
            massInverse: new Float32Array(this.settings.maxParticleCount).fill(0),
            density: new Float32Array(this.settings.maxParticleCount).fill(0),
            isNotStatic: new Int32Array(this.settings.maxParticleCount).fill(1),
            isNotFluid: new Int32Array(this.settings.maxParticleCount).fill(1),
            color: new Float32Array(this.settings.maxParticleCount * 3).fill(0),
            count: 0,
        }
    }

    private preSolve()
    {
        const gravity = new Float32Array(2);
        gravity[0] = this.settings.gravity.x;
        gravity[1] = this.settings.gravity.y;

        for (let i = 0; i < this.points.count; i++)
        {
            // apply gravity
            if (this.points.isNotStatic[i] === 1)
            {
                Vec.add(this.points.velocity, i, gravity, 0)

                // update previous position with current position
                Vec.copy(this.points.positionPrevious, i, this.points.positionCurrent, i);

                // update current position with velocity
                Vec.add(this.points.positionCurrent, i, this.points.velocity, i, this.settings.deltaTime);
            }
        }
    }

    private solve()
    {

    }

    private postSolve()
    {

    }

    public simulate()
    {
        this.simulationDuration = measureDuration(() =>
        {
            for (let i = 0; i < this.settings.subStepCount; i++)
            {
                this.preSolve();
                this.solve();
                this.postSolve();
            }
        });
    }

    public getWorldBoundingBox = () => this.worldBoundingBox;

    public setWorldBoundingBox(bottomLeft: Vec2d, topRight: Vec2d)
    {
        this.worldBoundingBox.minX = bottomLeft.x;
        this.worldBoundingBox.minY = bottomLeft.y;
        this.worldBoundingBox.maxX = topRight.x;
        this.worldBoundingBox.maxY = topRight.y;
    }
}