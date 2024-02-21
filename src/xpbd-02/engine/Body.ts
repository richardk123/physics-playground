import {Engine} from "./Engine";


export class Bodies
{
    private _engine: Engine;

    constructor(engine: Engine)
    {
        this._engine = engine;
    }

    rectangle(bottomLeftX: number,
             bottomLeftY: number,
             width: number,
             height: number,
             compliance: number,
             breakThreshold = 0.5,
             mass = 1): void
    {
        const points: number[] = [];

        for (let y = 0; y < height; y++)
        {
            for (let x = 0; x < width; x++)
            {
                points.push(this._engine.addPoint(bottomLeftX + x, bottomLeftY + y, mass))
            }
        }

        // Create constraints for neighboring points
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const currentIndex = y * width + x;

                // Right neighbor
                if (x < width - 1) {
                    const rightIndex = y * width + (x + 1);
                    this._engine.addDistanceConstraint(
                        points[currentIndex],
                        points[rightIndex],
                        breakThreshold,
                        compliance
                    );
                }

                // Bottom neighbor
                if (y < height - 1) {
                    const bottomIndex = (y + 1) * width + x;
                    this._engine.addDistanceConstraint(
                        points[currentIndex],
                        points[bottomIndex],
                        breakThreshold,
                        compliance
                    );
                }

                // Diagonal neighbor
                if (x < width - 1 && y < height - 1) {
                    const diagonalIndex = (y + 1) * width + (x + 1);
                    this._engine.addDistanceConstraint(
                        points[currentIndex],
                        points[diagonalIndex],
                        breakThreshold,
                        compliance
                    );
                }

                // Diagonal neighbor
                if (x < width - 1 && y < height - 1) {
                    const bottomIndex = (y + 1) * width + x;
                    const rightIndex = y * width + (x + 1);
                    this._engine.addDistanceConstraint(
                        points[rightIndex],
                        points[bottomIndex],
                        breakThreshold,
                        compliance
                    );
                }
            }
        }
    }
}