import { Card } from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import { TreeItem, TreeView } from "@mui/x-tree-view";
import { Engine } from "./engine/Engine";
import { timer } from "rxjs";

interface Props {
    engine: Engine;
}
export const SettingsSidebar = (props: Props) => {
    const [increment, setIncrement] = useState(0);
    const [duration, setDuration] = useState(0);
    const [particleCount, setParticleCount] = useState(0);
    const [distanceConstraintCount, setDistanceConstraintCount] = useState(0);

    useEffect(() => {
        const sub = timer(100).subscribe(() => {
            setDuration(Math.floor(props.engine.info().duration * 10) / 10);
            setParticleCount(props.engine.info().pointsCount);
            setDistanceConstraintCount(props.engine.info().distanceConstraintCount);
            setIncrement(increment + 1);
        });

        return () => sub.unsubscribe();
    }, [increment]);


    const reload = () => {
        window.location.reload();
    }

    return <div className="w-full h-full bg-physics-surface/30 backdrop-blur-xl border-l border-white/5 p-4 text-slate-200 overflow-y-auto">
        <button
            onClick={reload}
            className="w-full mb-4 px-4 py-2 bg-physics-primary/20 hover:bg-physics-primary/30 text-physics-primary border border-physics-primary/50 rounded-lg transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reload
        </button>
        <div className="space-y-2 text-sm text-slate-400 font-mono">
            <p className="flex justify-between"><span>Physics/frame:</span> <span className="text-slate-200">{duration}ms</span></p>
            <p className="flex justify-between"><span>Particles:</span> <span className="text-slate-200">{particleCount}</span></p>
            <p className="flex justify-between"><span>Constraints:</span> <span className="text-slate-200">{distanceConstraintCount}</span></p>
        </div>
    </div>
}