export interface Color {
    r: number,
    g: number,
    b: number,
}

export class Colors {
    static green = (): Color => {
        return { r: 50, g: 255, b: 50 } // Neon Green
    }

    static blue = (): Color => {
        return { r: 6, g: 182, b: 212 } // Cyan-500 (Electric Blue)
    }

    static pink = (): Color => {
        return { r: 244, g: 114, b: 182 } // Pink-400
    }

    static red = (): Color => {
        return { r: 248, g: 113, b: 113 } // Red-400
    }

    static darkYellow = (): Color => {
        return { r: 250, g: 204, b: 21 }; // Yellow-400
    }
}