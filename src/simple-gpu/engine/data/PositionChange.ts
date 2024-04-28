import {Buffer} from "../common/Buffer";
import {EngineSettings} from "./EngineSettings";
import {GPUEngine} from "../common/GPUEngine";

export class PositionChangeBuffer
{
    public buffer: Buffer;
    private settings: EngineSettings;

    constructor(engine: GPUEngine,
                settings: EngineSettings)
    {
        this.settings = settings;
        this.buffer = engine.createBuffer("positionChange", settings.maxParticleCount * 4 * 2, "storage");
    }

    public destroy()
    {
        this.buffer.destroy();
    }
}