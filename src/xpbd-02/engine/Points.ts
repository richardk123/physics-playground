
export interface PointsData
{
    x: Float32Array,
    y: Float32Array,
    prevX: Float32Array,
    prevY: Float32Array,
    velocityX: Float32Array,
    velocityY: Float32Array,
    mass: Float32Array,
    isStatic: Array<boolean>,
    count: number
}