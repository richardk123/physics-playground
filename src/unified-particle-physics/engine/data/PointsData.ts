
export interface PointsData
{
    positionCurrent: Float32Array,
    positionPrevious: Float32Array,
    velocity: Float32Array,
    massInverse: Float32Array,
    density: Float32Array,
    color: Float32Array,
    // 0 means is it static, 1 it is not
    isNotStatic: Int32Array,
    // 0 means it is fluid, 1 it is not
    isNotFluid: Int32Array,
    count: number;
}