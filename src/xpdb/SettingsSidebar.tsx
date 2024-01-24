import {Card, List, ListItem} from "@material-tailwind/react";
import React from "react";
import {Shape} from "./engine/Shape";
import {Renderer} from "./renderer/Renderer";

interface Props
{
    shapes: Shape[];
    renderer: Renderer;
}
export const SettingsSidebar = (props: Props) =>
{
    const renderPoints = (s: Shape) =>
    {
        return <ul className="list-none pl-4">
            {s.points.map((s, i) =>
            {
                return <li className="mb-2" key={i} onClick={() => props.renderer.lookAt(s.position[0], s.position[1])}>
                    {i} - point
                </li>;
            })}
        </ul>;
    }

    const renderShapes = () =>
    {
        return <ul>
            {props.shapes.map((s, i) =>
            {
                return <li className="mb-2" key={i} onClick={() => props.renderer.lookAt(s.center[0], s.center[1])}>
                    {s.index} - {s.name}
                    {renderPoints(s)}
                </li>;
            })}
        </ul>;
    }


    return <Card className="w-96">
        {renderShapes()}
    </Card>
}