import {Buffer} from "../common/Buffer";
import {GPUEngine} from "../common/GPUEngine";
import {EngineSettings} from "./EngineSettings";

export class Grid
{
    public numberOfCells: number;
    public cellParticleCount: Uint32Array;
    public cellParticleIndexes: Uint32Array;

    constructor(cellParticleCountData: ArrayBuffer,
                cellParticleIndexesData: ArrayBuffer,
                numberOfCells: number)
    {
        this.cellParticleCount = new Uint32Array(cellParticleCountData);
        this.cellParticleIndexes = new Uint32Array(cellParticleIndexesData);
        this.numberOfCells = numberOfCells;
    }

}

export class GridBuffer
{
    public cellParticleCountBuffer: Buffer;
    public cellParticleIndexesBuffer: Buffer;
    private settings: EngineSettings;
    public gpuGrid: Grid;

    constructor(engine: GPUEngine,
                settings: EngineSettings)
    {
        this.settings = settings;
        const size = this.getNumberOfCells() * 4;
        this.cellParticleCountBuffer = engine.createBuffer("cellParticleCount", size, "storage");
        this.cellParticleIndexesBuffer = engine.createBuffer("cellParticleIndexes", size * 8, "storage");
        this.gpuGrid = new Grid(new ArrayBuffer(0), new ArrayBuffer(0), 0);
    }

    public getNumberOfCells()
    {
        return this.settings.gridSizeX * this.settings.gridSizeY;
    }

    public async loadFromGpu(): Promise<void>
    {
        const cellsCountData = await this.cellParticleCountBuffer.readBuffer();
        const cellsParticleIndexesData = await this.cellParticleIndexesBuffer.readBuffer();

        const numberOfCells = this.getNumberOfCells();

        this.gpuGrid = new Grid(cellsCountData, cellsParticleIndexesData, numberOfCells);
    }
}