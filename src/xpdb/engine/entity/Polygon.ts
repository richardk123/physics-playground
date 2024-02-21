import {mat2, vec2} from "gl-matrix";
import {findGeometricCenter} from "../utils/CollisionUtils2";
import {Body} from "./Body";

export class Polygon
{
    static rectangle(topLeftX: number,
                     topLeftY: number,
                     width: number,
                     height: number): vec2[]
    {
        const x = topLeftX;
        const y = topLeftY;

        const p1 = vec2.fromValues(x, y);
        const p2 = vec2.fromValues(x + width, y);
        const p3 = vec2.fromValues(x + width, y - height);
        const p4 = vec2.fromValues(x, y - height);

        return [p1, p2, p3, p4];
    }

    static rotate = (points: vec2[], angleInRadians: number) =>
    {
        // Create a 2D rotation matrix
        const rotationMatrix = mat2.create();
        mat2.fromRotation(rotationMatrix, angleInRadians);
        const center = findGeometricCenter(points);

        return points.forEach(p => {

            const position = vec2.fromValues(p[0], p[1]);
            // Translate the point to the origin
            vec2.sub(position, position, center);

            // Multiply the translation vector by the rotation matrix
            vec2.transformMat2(position, position, rotationMatrix);

            // Translate the point back to its original position
            vec2.add(position, position, center);

            // Update the point position
            vec2.set(p, position[0], position[1]);
        });
    }
}