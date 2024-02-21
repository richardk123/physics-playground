import {Card} from "@material-tailwind/react";
import React, {useEffect, useState} from "react";
import {TreeItem, TreeView} from "@mui/x-tree-view";
import {EngineRenderer} from "./renderer/Renderer";
import {Engine} from "./engine/Engine";
import {timer} from "rxjs";
import { Constraint } from "./engine/constraint/Constraint";
import { PointMass } from "./engine/entity/PointMass";

interface Props
{
    engine: Engine;
    renderer: EngineRenderer;
}
export const SettingsSidebar = (props: Props) =>
{
    const [constraints, setConstraints] = useState<Constraint[]>([]);
    const [points, setPoints] = useState<PointMass[]>([]);

    useEffect(() =>
    {
        // const sub = timer(5000).subscribe(() =>
        // {
        //     setConstraints([...props.engine.constraints]);
        //     setPoints([...props.engine.points]);
        // });
        //
        // return () => sub.unsubscribe();
    }, [points]);

    const renderPoints = () =>
    {
        return <ul className="list-none pl-4">
            {points.map((p, i) =>
            {
                const label = `${i} - point`;
                const nodeId = `point${i}`;
                return <TreeItem key={i} nodeId={nodeId} label={label} onClick={() => props.renderer.lookAt(p.position[0], p.position[1])} />
            })}
        </ul>;
    }

    //TODO: sem tlacitko zoom in a zoom out

    const reload = () =>
    {
        window.location.reload();
    }

    return <Card className="w-96 h-full">
        <button onClick={reload}>Reload</button>
        <TreeView
            aria-label="file system navigator"
            sx={{ height: 240, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
        >
            <p>Constraints count: {constraints.length}</p>
            <p>Points count: {points.length}</p>
            {renderPoints()}
        </TreeView>
    </Card>
}