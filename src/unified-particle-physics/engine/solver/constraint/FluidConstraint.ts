import {Vec} from "../utils/Vec";
import {PointsData} from "../data/PointsData";
import {createGrid} from "../../../../xpbd-02/engine/Grid";
import {Grid} from "../utils/Grid";
import {SolverSettings} from "../Solver";

const positionChange = new Float32Array(2);
const vecs = new Float32Array(2);

export interface FluidConstraintData
{
    indexFrom: number,
    indexTo: number;
    fluidSettings: FluidSettings;
}

export interface FluidSettings
{
    pressureMultiplier: number;
    smoothingRadius: number;
    targetDensity: number;
}
 const setCalculatedPointDensity = (grid: Grid,
                                          points: PointsData,
                                          fluidSettings: FluidSettings,
                                          indexFrom: number,
                                          indexTo: number) =>
{
    for (let index = indexFrom; index < indexTo; index++)
    {
        const smoothingKernel = (radius: number, distance: number) =>
        {
            if (distance >= radius) return 0;
            const volume = (Math.PI * Math.pow(radius, 4)) / 6;
            return (radius - distance) * (radius - distance) / volume;
        }

        const surrounding = grid.getInSurroundingCells(
            points.positionCurrent[index * 2],
            points.positionCurrent[index * 2 + 1]);

        surrounding.forEach(index2 =>
        {
            const distance = Math.sqrt(Vec.distSquared(points.positionCurrent, index, points.positionCurrent, index2));
            const influence = smoothingKernel(fluidSettings.smoothingRadius, distance);
            points.density[index] += influence * (1 / points.massInverse[index]);
        });
    }
}

const solveOnePoint = (grid: Grid,
                       points: PointsData,
                       settings: FluidSettings,
                       index: number,
                       dt: number) =>
{
    const smoothingKernelDerivative = (distance: number,
                                       radius: number) =>
    {
        if (distance >= radius) return 0;
        const scale = 12 / (Math.pow(radius, 4) * Math.PI);
        return (distance - radius) * scale;
    }

    const convertDensityToPressure = (density: number) =>
    {
        const densityError = density - settings.targetDensity;
        return densityError * settings.pressureMultiplier;
    }

    const calculateSharedPressure = (densityA: number, densityB: number) =>
    {
        const pressureA = convertDensityToPressure(densityA);
        const pressureB = convertDensityToPressure(densityB);
        return (pressureA + pressureB) / 2;
    }

    const calculateMoveVector = (): void =>
    {
        const surrounding = grid.getInSurroundingCells(
            points.positionCurrent[index * 2],
            points.positionCurrent[index * 2 + 1]);

        for (let j = 0; j < surrounding.length; j++)
        {
            const index2 = surrounding[j];

            if (index === index2)
            {
                continue;
            }

            vecs.fill(0);

            Vec.setDiff(vecs, 0, points.positionCurrent, index2, points.positionCurrent, index);
            const distance = Math.sqrt(Vec.lengthSquared(vecs, 0));

            if (distance === 0)
            {
                continue;
            }

            // make unit vector
            Vec.scale(vecs, 0, 1 / distance);

            const slope = smoothingKernelDerivative(distance, settings.smoothingRadius);
            const density = points.density[index2];
            const mass = 1 / points.massInverse[index];
            const sharedPressure = calculateSharedPressure(density, points.density[index]);
            Vec.add(positionChange, 0, vecs, 0, (sharedPressure * slope * mass) / density);
        }
    }
    positionChange.fill(0);
    calculateMoveVector();

    Vec.add(points.positionCurrent, index, positionChange, 0, dt);
}

export const solveFluidConstraint = (points: PointsData,
                                     settings: FluidSettings,
                                     engineSettings: SolverSettings,
                                     indexFrom: number,
                                     indexTo: number) =>
{
    // clear density
    points.density.fill(0);

    const grid = createGrid(points.count, (settings.smoothingRadius / Math.sqrt(2)));

    for (let i = 0; i < points.count; i++)
    {
        grid.add(points.positionCurrent[i * 2], points.positionCurrent[i * 2 + 1], i);
    }

    setCalculatedPointDensity(grid, points, settings, indexFrom, indexTo);

    for (let i = indexFrom; i < indexTo; i++)
    {
        solveOnePoint(grid, points, settings, i, engineSettings.deltaTime);
    }
}