import {Buffer} from "../common/Buffer";
import {GPUEngine} from "../common/GPUEngine";
import {EngineSettings} from "./EngineSettings";
import {Particles} from "./Particles";

export class Grid
{
    public cellParticleCount: Uint32Array;
    public particleCellOffset: Uint32Array;

    constructor(cellParticleCountData: ArrayBuffer,
                particleCellOffsetData: ArrayBuffer)
    {
        this.cellParticleCount = new Uint32Array(cellParticleCountData);
        this.particleCellOffset = new Uint32Array(particleCellOffsetData);
    }
}

export class GridBuffer
{
    public cellParticleCountBuffer: Buffer;
    public particleCellOffsetBuffer: Buffer;
    private settings: EngineSettings;
    public gpuGrid: Grid;

    constructor(engine: GPUEngine,
                settings: EngineSettings)
    {
        this.settings = settings;

        const numberOfCells = this.settings.gridSizeX * this.settings.gridSizeY;

        this.cellParticleCountBuffer = engine.createBuffer("cellParticleCount", numberOfCells * 4, "storage");
        this.particleCellOffsetBuffer = engine.createBuffer("particleCellOffset", settings.maxParticleCount, "storage");
        this.gpuGrid = new Grid(new ArrayBuffer(0), new ArrayBuffer(0));
    }

    public async loadFromGpu(): Promise<void>
    {
        const cellsCountData = await this.cellParticleCountBuffer.readBuffer();
        const cellsParticleIndexesData = await this.particleCellOffsetBuffer.readBuffer();

        this.gpuGrid = new Grid(cellsCountData, cellsParticleIndexesData);
    }
}