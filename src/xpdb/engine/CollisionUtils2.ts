import {vec2} from "gl-matrix";


export const createLineNormal = (p1: vec2, p2: vec2) =>
{
    const diff = vec2.sub(vec2.create(), p2, p1);
    const result = vec2.fromValues(-diff[1], diff[0]);
    return vec2.normalize(result, result);
}

export const findGeometricCenter = (vertices: vec2[]) =>
{
    let sumX = 0;
    let sumY = 0;

    for (let i = 0; i < vertices.length; i++)
    {
        const v = vertices[i];
        sumX += v[0];
        sumY += v[1];
    }
    return vec2.fromValues(sumX / vertices.length, sumY / vertices.length);
}

export const projectVerticesToAxis = (vertices: vec2[], axis: vec2) =>
{
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;

    for (let i = 0; i < vertices.length; i++)
    {
        const v = vertices[i];
        const proj = vec2.dot(v, axis);
        if (proj < min)
        {
            min = proj;
        }
        if (proj> max)
        {
            max = proj;
        }
    }

    return {min: min, max: max};
}



export const intersectPolygons = (polygon1: vec2[], polygon2: vec2[]) =>
{
    let normal = vec2.create();
    let depth = Number.MAX_VALUE;

    for (let i = 0; i < polygon1.length; i++)
    {
        const p1 = polygon1[i];
        const p2 = polygon1[(i + 1) % polygon1.length];
        const axis = createLineNormal(p1, p2);

        const proj1 = projectVerticesToAxis(polygon1, axis);
        const proj2 = projectVerticesToAxis(polygon2, axis);

        if (proj1.min >= proj2.max || proj2.min >= proj1.max)
        {
            return {intersects: false};
        }

        const axisDepth = Math.min(proj2.max - proj1.min, proj1.max - proj2.min);

        if (axisDepth < depth)
        {
            depth = axisDepth;
            normal = axis;
        }
    }

    for (let i = 0; i < polygon2.length; i++)
    {
        const p1 = polygon2[i];
        const p2 = polygon2[(i + 1) % polygon2.length];
        const axis = createLineNormal(p1, p2);

        const proj1 = projectVerticesToAxis(polygon1, axis);
        const proj2 = projectVerticesToAxis(polygon2, axis);

        if (proj1.min >= proj2.max || proj2.min >= proj1.max)
        {
            return {intersects: false};
        }

        const axisDepth = Math.min(proj2.max - proj1.min, proj1.max - proj2.min);

        if (axisDepth < depth)
        {
            depth = axisDepth;
            normal = axis;
        }
    }

    const center1 = findGeometricCenter(polygon1);
    const center2 = findGeometricCenter(polygon2);

    const direction = vec2.sub(vec2.create(), center2, center1);

    if (vec2.dot(direction, normal) < 0)
    {
        vec2.negate(normal, normal);
    }

    return {intersects: true, normal: normal, depth: depth};
}