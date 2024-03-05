import {Grid} from "../Grid";
import {PointsData} from "../Points";
import {Vec} from "../utils/Vec";
import {DAMPING, PRESSURE_MULTIPLIER, SMOOTHING_RADIUS, TARGET_DENSITY} from "../Constants";

const positionChange = new Float32Array(2);
const vecs = new Float32Array(2);

export const calculateDensity = (grid: Grid,
                                 points: PointsData,
                                 index: number) =>
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
        const influence = smoothingKernel(SMOOTHING_RADIUS, distance);
        points.density[index] += influence * (1 / points.massInverse[index]);
    })
}

export const solveFluidConstraint = (grid: Grid,
                                     points: PointsData,
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
        const densityError = density - TARGET_DENSITY;
        return densityError * PRESSURE_MULTIPLIER;
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

            const slope = smoothingKernelDerivative(distance, SMOOTHING_RADIUS);
            const density = points.density[index2];
            const mass = 1 / points.massInverse[index];
            const sharedPressure = calculateSharedPressure(density, points.density[index]);
            Vec.add(positionChange, 0, vecs, 0, (sharedPressure * slope * mass) / density);
            Vec.scale(positionChange, 0, DAMPING);
        }
    }
    positionChange.fill(0);
    calculateMoveVector();

    Vec.add(points.positionCurrent, index, positionChange, 0, dt);

}