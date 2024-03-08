import Sketch from "react-p5";
import p5Types from "p5";
import {useState} from "react";

interface Props
{
    render: (p5: p5Types, canvas: HTMLCanvasElement) => void;
    setup: (p5: p5Types, canvas: HTMLCanvasElement) => void;
}

export const P5Renderer = (props: Props) =>
{
    const [parent, setParent] = useState<Element>();
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

    const setup = (p5: p5Types, canvasParentRef: Element) =>
    {
        setParent(canvasParentRef);
        p5.createCanvas(10, 10).parent(canvasParentRef);
        const c = canvasParentRef.querySelector('canvas');
        setCanvas(c);
        props.setup(p5, c!);
        c!.oncontextmenu = e =>
        {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    const resizeToFit = (p5: p5Types) =>
    {
        const parentWidth = parent!.clientWidth;
        const parentHeight = parent!.clientHeight;

        // Set the canvas dimensions
        p5.resizeCanvas(parentWidth, parentHeight, true);
    }

    const draw = (p5: p5Types) => {
        resizeToFit(p5);
        p5.background(255);
        props.render(p5, canvas!);
    };

    return <Sketch setup={setup} draw={draw} className="w-full h-full" />;
}