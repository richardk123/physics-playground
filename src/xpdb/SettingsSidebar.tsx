import { Card } from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import { TreeItem, TreeView } from "@mui/x-tree-view";
import { EngineRenderer } from "./renderer/Renderer";
import { Engine } from "./engine/Engine";
import { timer } from "rxjs";
import { Constraint } from "./engine/constraint/Constraint";
import { PointMass } from "./engine/entity/PointMass";

interface Props {
    engine: Engine;
    renderer: EngineRenderer;
}
export const SettingsSidebar = (props: Props) => {
    const [constraints, setConstraints] = useState<Constraint[]>([]);
    const [points, setPoints] = useState<PointMass[]>([]);

    useEffect(() => {
        // const sub = timer(5000).subscribe(() =>
        // {
        //     setConstraints([...props.engine.constraints]);
        //     setPoints([...props.engine.points]);
        // });
        //
        // return () => sub.unsubscribe();
    }, [points]);

    const renderPoints = () => {
        return <ul className="list-none pl-4">
            {points.map((p, i) => {
                const label = `${i} - point`;
                const nodeId = `point${i}`;
                return <TreeItem key={i} nodeId={nodeId} label={label} onClick={() => props.renderer.lookAt(p.position[0], p.position[1])} />
            })}
        </ul>;
    }

    //TODO: sem tlacitko zoom in a zoom out

    const reload = () => {
        window.location.reload();
    }

    return <div className="w-full h-full bg-physics-surface/30 backdrop-blur-xl border-l border-white/5 p-4 text-slate-200 overflow-y-auto">
        <button
            onClick={reload}
            className="w-full mb-4 px-3 py-2 bg-physics-primary/10 hover:bg-physics-primary/20 text-physics-primary border border-physics-primary/30 rounded-md transition-all duration-200 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-physics-primary/5 hover:shadow-physics-primary/10"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reload Simulation
        </button>
        <TreeView
            aria-label="file system navigator"
            sx={{ height: 240, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
        >
            <div className="mb-4 space-y-1 text-sm text-slate-400">
                <p>Constraints: <span className="text-slate-200 font-mono">{constraints.length}</span></p>
                <p>Points: <span className="text-slate-200 font-mono">{points.length}</span></p>
            </div>
            {renderPoints()}
        </TreeView>
    </div>
}