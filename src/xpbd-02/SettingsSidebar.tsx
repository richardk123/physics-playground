import {Card} from "@material-tailwind/react";
import React, {useEffect, useState} from "react";
import {TreeItem, TreeView} from "@mui/x-tree-view";
import {Engine} from "./engine/Engine";
import {timer} from "rxjs";

interface Props
{
    engine: Engine;
}
export const SettingsSidebar = (props: Props) =>
{
    const [duration, setDuration] = useState(0);

    useEffect(() =>
    {
        const sub = timer(100).subscribe(() =>
        {
            setDuration(Math.floor(props.engine.duration() * 10) / 10);
        });

        return () => sub.unsubscribe();
    }, [duration]);


    const reload = () =>
    {
        window.location.reload();
    }

    return <Card className="w-96 h-full">
        <button onClick={reload}>Reload</button>
        <p>Physics ms per frame: {duration}</p>
    </Card>
}