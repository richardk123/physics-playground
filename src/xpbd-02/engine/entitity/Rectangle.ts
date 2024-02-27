import {ParticleFormation} from "./ParticleFormation";
import {Engine} from "../Engine";
import {mat2, vec2} from "gl-matrix";
import {findGeometricCenter} from "../utils/MathUtils";
import {Color} from "./Color";

export class Rectangle implements ParticleFormation
{
    indexFrom : number;
    indexTo = 0;
    private _engine: Engine;
    private pointIndexes: number[] = [];
    private width: number;
    private height: number;
    private compliance: number;
    private breakThreshold: number;

    constructor(engine: Engine,
                bottomLeftX: number,
                bottomLeftY: number,
                width: number,
                height: number,
                compliance: number,
                breakThreshold = 0.5,
                mass = 1,
                color: Color = {r: 25, g: 255, b: 25} as Color)
    {
        this._engine = engine;
        this.height = height;
        this.width = width;
        this.compliance = compliance;
        this.breakThreshold = breakThreshold;

        for (let y = 0; y < height; y++)
        {
            for (let x = 0; x < width; x++)
            {
                this.pointIndexes.push(this._engine.addPoint(bottomLeftX + x, bottomLeftY + y, mass, color))
            }
        }

        this.indexFrom = this.pointIndexes[0];
        this.indexTo = this.pointIndexes[this.pointIndexes.length - 1];
    }

    withNeighbouringConstraints = () =>
    {

        // Create constraints for neighboring points
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const currentIndex = y * this.width + x;

                // Right neighbor
                if (x < this.width - 1) {
                    const rightIndex = y * this.width + (x + 1);
                    this._engine.addDistanceConstraint(
                        this.pointIndexes[currentIndex],
                        this.pointIndexes[rightIndex],
                        this.breakThreshold,
                        this.compliance
                    );
                }

                // Bottom neighbor
                if (y < this.height - 1) {
                    const bottomIndex = (y + 1) * this.width + x;
                    this._engine.addDistanceConstraint(
                        this.pointIndexes[currentIndex],
                        this.pointIndexes[bottomIndex],
                        this.breakThreshold,
                        this.compliance
                    );
                }

                // Diagonal neighbor
                if (x < this.width - 1 && y < this.height - 1) {
                    const diagonalIndex = (y + 1) * this.width + (x + 1);
                    this._engine.addDistanceConstraint(
                        this.pointIndexes[currentIndex],
                        this.pointIndexes[diagonalIndex],
                        this.breakThreshold,
                        this.compliance
                    );
                }

                // Diagonal neighbor
                if (x < this.width - 1 && y < this.height - 1) {
                    const bottomIndex = (y + 1) * this.width + x;
                    const rightIndex = y * this.width + (x + 1);
                    this._engine.addDistanceConstraint(
                        this.pointIndexes[rightIndex],
                        this.pointIndexes[bottomIndex],
                        this.breakThreshold,
                        this.compliance
                    );
                }
            }
        }

        return this;
    }


    rotate(angleInRadians: number): void
    {
        const points = this._engine.points.positionCurrent;
        // Create a 2D rotation matrix
        const rotationMatrix = mat2.create();
        mat2.fromRotation(rotationMatrix, angleInRadians);
        const center = findGeometricCenter(points, this.indexFrom, this.indexTo);

        for (let i = this.indexFrom; i <= this.indexTo; i++)
        {
            const position = vec2.fromValues(
                points[i * 2 + 0],
                points[i * 2 + 1]);

            // Translate the point to the origin
            vec2.sub(position, position, center);

            // Multiply the translation vector by the rotation matrix
            vec2.transformMat2(position, position, rotationMatrix);

            // Translate the point back to its original position
            vec2.add(position, position, center);

            // Update the point position
            points[i * 2 + 0] = position[0];
            points[i * 2 + 1] = position[1];
        }
    }

    setVelocity(x: number, y: number): void
    {
        const velocities = this._engine.points.velocity;

        for (let i = this.indexFrom; i <= this.indexTo; i++)
        {
            velocities[i * 2 + 0] = x;
            velocities[i * 2 + 1] = y;
        }
    }

}