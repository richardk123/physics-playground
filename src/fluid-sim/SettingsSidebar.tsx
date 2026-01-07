import { Card } from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import { Engine } from "./engine/Engine";
import { timer } from "rxjs";

interface Props {
    engine: Engine;
}
export const SettingsSidebar = (props: Props) => {
    const [increment, setIncrement] = useState(0);
    const [simulationDuration, setSimulationDuration] = useState(0);
    const [preSolveDuration, setPreSolveDuration] = useState(0);
    const [solveDuration, setSolveDuration] = useState(0);
    const [postSolveDuration, setPostSolveDuration] = useState(0);
    const [particleCount, setParticleCount] = useState(0);
    const [averageDensity, setAverageDensity] = useState(0);

    useEffect(() => {
        const sub = timer(100).subscribe(() => {
            const DIGITS = 100;
            setSimulationDuration(Math.floor(props.engine.info().simulationDuration * DIGITS) / DIGITS);
            setPreSolveDuration(Math.floor(props.engine.info().preSolveDuration * DIGITS) / DIGITS);
            setSolveDuration(Math.floor(props.engine.info().solveDuration * DIGITS) / DIGITS);
            setPostSolveDuration(Math.floor(props.engine.info().postSolveDuration * DIGITS) / DIGITS);

            setParticleCount(props.engine.info().pointsCount);
            setAverageDensity(props.engine.info().averageDensity)
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
            <p className="flex justify-between"><span>Total/frame:</span> <span className="text-slate-200">{simulationDuration}ms</span></p>
            <div className="pl-2 border-l border-white/10 space-y-1 text-xs">
                <p className="flex justify-between"><span>PreSolve:</span> <span>{preSolveDuration}ms</span></p>
                <p className="flex justify-between"><span>Solve:</span> <span>{solveDuration}ms</span></p>
                <p className="flex justify-between"><span>PostSolve:</span> <span>{postSolveDuration}ms</span></p>
            </div>
            <p className="flex justify-between pt-2 border-t border-white/10"><span>Particles:</span> <span className="text-slate-200">{particleCount}</span></p>
            <p className="flex justify-between"><span>Avg Density:</span> <span className="text-slate-200">{Math.floor(averageDensity * 1000) / 1000}</span></p>
        </div>
    </div>
}