import Sketch from "react-p5";
import p5Types from "p5";
import {useState} from "react";

interface Props
{

}

export const Renderer = () =>
{
    const [parent, setParent] = useState<Element>();

    const setup = (p5: p5Types, canvasParentRef: Element) =>
    {
        setParent(canvasParentRef);
        p5.createCanvas(10, 10).parent(canvasParentRef);
    };


    const resizeToFit = (p5: p5Types) =>
    {
        if (!parent)
        {
            console.log("parent not found");
            return;
        }

        const parentWidth = parent.clientWidth;
        const parentHeight = parent.clientHeight;

        // Set the canvas dimensions
        p5.resizeCanvas(parentWidth, parentHeight, false);
    }

    const draw = (p5: p5Types) => {
        resizeToFit(p5);
        p5.background(0);
        p5.ellipse(100, 100, 70, 70);
    };

    return <Sketch setup={setup} draw={draw} className="w-full h-full" />;
}