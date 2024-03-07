
export interface Point
{
    x: number,
    y: number,
}

export interface Transform
{
    toSimulation: (x: number, y: number) => Point,
    toScreen: (x: number, y: number) => Point,
    toSimulationScale: (distance: number) => number,
    toScreenScale: (distance: number) => number,
    simulatorWidth: number,
    simulatorHeight: number,
}

export class Transformer
{
    static create = (width = 800,
                     height= 600,
                     lookAtPos: Point = {x: 0, y: 0},
                     simulatorMinWidth = 40): Transform =>
    {
        const cScale = Math.min(width, height) / simulatorMinWidth;
        const simWidth = width / cScale;
        const simHeight = height / cScale;

        const toScreen = (x: number, y: number) =>
        {
            const xn = (x - lookAtPos.x) * cScale + width / 2;
            const yn = height / 2 - (y - lookAtPos.y) * cScale;
            return {x: xn, y: yn} as Point;
        }

        const toSimulation = (x: number, y: number) => {
            const xn = (x - width / 2) / cScale + lookAtPos.x;
            const yn = (height / 2 - y) / cScale + lookAtPos.y;
            return { x: xn, y: yn } as Point;
        };

        const toSimulationScale = (distance: number): number => {
            return distance / cScale;
        };

        const toScreenScale = (distance: number): number => {
            return distance * cScale;
        };

        return {
            toSimulation: toSimulation,
            toScreen: toScreen,
            toSimulationScale: toSimulationScale,
            toScreenScale: toScreenScale,
            simulatorWidth: simWidth,
            simulatorHeight: simHeight,
        };
    }
}