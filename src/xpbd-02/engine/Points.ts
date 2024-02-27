
export interface PointsData
{
    positionCurrent: Float32Array,
    positionPrevious: Float32Array,
    velocity: Float32Array,
    massInverse: Float32Array,
    color: Float32Array,
    isStatic: Array<boolean>,
    count: number
}