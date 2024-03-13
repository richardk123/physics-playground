export interface PointsDataShared
{
    positionCurrentShaded: SharedArrayBuffer;
    positionPreviousShared: SharedArrayBuffer;
    velocityShared: SharedArrayBuffer;
    massInverseShared: SharedArrayBuffer;
    densityShared: SharedArrayBuffer;
    colorShared: SharedArrayBuffer;
    isNotStaticShared: SharedArrayBuffer;
    isNotFluidShared: SharedArrayBuffer;
    count: number;

}
export class PointsData implements PointsDataShared
{
    public positionCurrentShaded: SharedArrayBuffer;
    public positionCurrent: Float32Array;

    public positionPreviousShared: SharedArrayBuffer;
    public positionPrevious: Float32Array;

    public velocityShared: SharedArrayBuffer;
    public velocity: Float32Array;

    public massInverseShared: SharedArrayBuffer;
    public massInverse: Float32Array;

    public densityShared: SharedArrayBuffer;
    public density: Float32Array;

    public colorShared: SharedArrayBuffer;
    public color: Float32Array;

    // 0 means is it static; 1 it is not
    public isNotStaticShared: SharedArrayBuffer;
    public isNotStatic: Int32Array;

    // 0 means it is fluid; 1 it is not
    public isNotFluidShared: SharedArrayBuffer;
    public isNotFluid: Int32Array;
    public count: number;

    private constructor(dataShared: PointsDataShared)
    {
        this.positionCurrentShaded = dataShared.positionCurrentShaded;
        this.positionPreviousShared = dataShared.positionPreviousShared;
        this.velocityShared = dataShared.velocityShared;
        this.massInverseShared = dataShared.massInverseShared;
        this.densityShared = dataShared.densityShared;
        this.colorShared = dataShared.colorShared;
        this.isNotStaticShared = dataShared.isNotStaticShared
        this.isNotFluidShared = dataShared.isNotFluidShared;

        this.positionCurrent = new Float32Array(this.positionCurrentShaded);
        this.positionPrevious = new Float32Array(this.positionPreviousShared)
        this.velocity = new Float32Array(this.velocityShared);
        this.massInverse = new Float32Array(this.massInverseShared);
        this.density = new Float32Array(this.densityShared);
        this.color = new Float32Array(this.colorShared);
        this.isNotStatic = new Int32Array(this.isNotStaticShared);
        this.isNotFluid = new Int32Array(this.isNotFluidShared);

        this.count = dataShared.count;
    }

    public static create(maxParticleCount: number): PointsData
    {
        const pointsDataShared: PointsDataShared =
        {
            positionCurrentShaded: new SharedArrayBuffer(maxParticleCount * 2 * 4),
            positionPreviousShared: new SharedArrayBuffer(maxParticleCount * 2 * 4),
            velocityShared: new SharedArrayBuffer(maxParticleCount * 2 * 4),
            massInverseShared: new SharedArrayBuffer(maxParticleCount * 4),
            densityShared: new SharedArrayBuffer(maxParticleCount * 4),
            colorShared: new SharedArrayBuffer(maxParticleCount * 3 * 4),
            isNotStaticShared: new SharedArrayBuffer(maxParticleCount * 4),
            isNotFluidShared: new SharedArrayBuffer(maxParticleCount * 4),
            count: 0,
        }
        const pointsData = new PointsData(pointsDataShared);
        pointsData.positionCurrent.fill(0);
        pointsData.positionPrevious.fill(0);
        pointsData.velocity.fill(0);
        pointsData.massInverse.fill(0);
        pointsData.density.fill(0);
        pointsData.color.fill(0);
        pointsData.isNotStatic.fill(1);
        pointsData.isNotFluid.fill(1);

        return pointsData;
    }

    public static createFromSharedBuffers(pointsDataShared: PointsDataShared): PointsData
    {
        return new PointsData(pointsDataShared);
    }
}