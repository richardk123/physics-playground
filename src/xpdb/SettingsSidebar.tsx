import {Card} from "@material-tailwind/react";
import React, {useEffect, useState} from "react";
import {Shape} from "./engine/Shape";
import {TreeItem, TreeView} from "@mui/x-tree-view";
import {EngineRenderer} from "./renderer/Renderer";
import {Engine} from "./engine/Engine";
import {timer} from "rxjs";

interface Props
{
    engine: Engine;
    renderer: EngineRenderer;
}
export const SettingsSidebar = (props: Props) =>
{
    const [shapes, setShapes] = useState<Shape[]>([]);

    useEffect(() =>
    {
        const sub = timer(100).subscribe(() =>
        {
            setShapes([...props.engine.shapes]);
        });

        return () => sub.unsubscribe();
    }, [shapes]);

    const renderPoints = (s: Shape, si: number) =>
    {
        return <ul className="list-none pl-4">
            {s.points.map((p, i) =>
            {
                const label = `${i} - point`;
                const nodeId = `${si}point${i}`;
                return <TreeItem key={i} nodeId={nodeId} label={label} onClick={() => props.renderer.lookAt(p.position[0], p.position[1])} />
            })}
        </ul>;
    }

    const renderShapes = () =>
    {
        return <>
            {shapes.map((s, i) =>
            {
                const label = `${s.index} - ${s.name}`;
                const nodeId = `${i}shape`;
                return <TreeItem key={i} nodeId={nodeId} onClick={() => props.renderer.lookAt(s.points[0].position[0], s.points[0].position[1])} label={label}>
                    {renderPoints(s, i)}
                </TreeItem>;
            })}
        </>;
    }

    //TODO: sem tlacitko zoom in a zoom out

    return <Card className="w-96 h-full">
        <TreeView
            aria-label="file system navigator"
            sx={{ height: 240, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
        >
            {renderShapes()}
        </TreeView>
        <button>ass</button>
    </Card>
}