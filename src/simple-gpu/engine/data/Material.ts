import {Buffer} from "../common/Buffer";
import {GPUEngine} from "../common/GPUEngine";
import {EngineSettings} from "./EngineSettings";

const OFFSET = 4;

export interface Material
{
    targetDensity: number;
    pressureMultiplier: number;
    smoothingRadius: number;
}

export class Materials
{
    public materials: Material[];

    private constructor(materials: Material[])
    {
        this.materials = materials;
    }

    static create()
    {
        return new Materials([]);
    }

    static createFromBuffer(data: Float32Array)
    {
        const aggregateData = (array: Float32Array) => {
            return array.reduce((acc: number[][], curr: number, index: number, array: Float32Array) => {
                if (index % OFFSET === 0) {
                    acc.push([array[index + 0], array[index + 1], array[index + 2], array[index + 3], array[index + 4]]);
                }
                return acc;
            }, []);
        }

        const materials = aggregateData(data)
            .map((rawData, i) =>
            {
                return {
                    targetDensity: rawData[0],
                    pressureMultiplier: rawData[1],
                    smoothingRadius: rawData[2]} as Material
            })

        return new Materials(materials);
    }

    public count()
    {
        return this.materials.length;
    }

    public addMaterial(material: Material)
    {
        return this.materials.push(material);
    }

    public serializeMaterials(maxMaterialCount: number)
    {
        const data = new Float32Array(maxMaterialCount)
        this.materials.forEach((m, i) =>
        {
            data[i * OFFSET + 0] = m.targetDensity;
            data[i * OFFSET + 1] = m.pressureMultiplier;
            data[i * OFFSET + 2] = m.smoothingRadius;
            data[i * OFFSET + 3] = 0;
        })

        return data;
    }
}

export class MaterialsBuffer
{
    private settings: EngineSettings;
    public buffer: Buffer;

    public materials: Materials;
    public gpuMaterials: Materials;

    constructor(engine: GPUEngine,
                settings: EngineSettings,
                materials: Materials)
    {
        this.settings = settings;
        this.buffer = engine.createBuffer("materials", settings.maxMaterialCount * 4 * OFFSET, "storage");
        this.materials = materials;
        this.gpuMaterials = Materials.create();
    }

    public write()
    {
        const data = this.materials.serializeMaterials(this.settings.maxMaterialCount);
        this.buffer.writeBuffer(data);
    }

    public async loadFromGpu()
    {
        const materialsCount = this.materials.count();
        const data = await this.buffer.readBuffer(materialsCount * OFFSET * 4);
        this.gpuMaterials = Materials.createFromBuffer(new Float32Array(data));
    }

    public async printMaterialsFromGpu()
    {
        const matString = this.gpuMaterials.materials.map((m, i) =>
        {
            return ` index: ${i}: targetDensity: ${m.targetDensity}, pressureMultiplier: ${m.pressureMultiplier}, smoothingRadius: ${m.smoothingRadius}`;
        })

        console.log(`materials: \n${matString.join("\n")}`);
    }

    public destroy()
    {
        this.buffer.destroy();
    }
}