import { P5Renderer } from "../components/P5Renderer";
import React, { useEffect, useMemo, useRef } from "react";
import { Engines } from "./engine/Engine";
import p5Types from "p5";
import { Renderers } from "./engine/Renderer";
import { ParticleFormations } from "./engine/entitity/ParticleFormation";
import { SettingsSidebar } from "./SettingsSidebar";
import { mouseMove$ } from "./engine/utils/CanvasUtils";
import { Colors } from "./engine/entitity/Color";
import { Subscription } from "rxjs";

export const VisualizationFluidSim = () => {
    const engine = useMemo(() => Engines.create(), []);
    const subs = useRef<Subscription>(new Subscription());

    // Initialize renderer once
    const renderer = useMemo(() => {
        const r = Renderers.create(engine);
        r.lookAt(50, 50);
        r.setSimulationWidth(100);
        return r;
    }, [engine]);

    const bodies = useMemo(() => new ParticleFormations(engine), [engine]);

    // Use a ref to hold the collision circle to access it in setup subscription
    const collisionCircleRef = useRef<any>(null);

    useEffect(() => {
        // Initialize Scene
        bodies.rectangle(
            20,
            20,
            35,
            35,
            1,
            Colors.blue());

        // Create collision circle and store in ref
        collisionCircleRef.current = bodies.collisionCircle(1000, 1000, 10);

        return () => {
            subs.current.unsubscribe();
        }
    }, [bodies]);

    const setup = (p5: p5Types, canvas: HTMLCanvasElement) => {
        renderer.render(p5);
        const sub = mouseMove$(canvas).subscribe(position => {
            if (collisionCircleRef.current) {
                const simPos = renderer.transform().toSimulation(position[0], position[1]);
                collisionCircleRef.current.setPosition(simPos.x, simPos.y);
            }
        });
        subs.current.add(sub);
    }

    const render = (p5: p5Types) => {
        engine.simulate(1 / 60);
        renderer.render(p5);
    }

    return <div className="flex h-full w-full justify-center">
        <div className="flex flex-col overflow-hidden" style={{ width: '900px' }}>
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 h-full w-full">
                <P5Renderer render={render} setup={setup} />
            </main>
        </div>
        <div className="w-64 text-white">
            <SettingsSidebar engine={engine} />
        </div>
    </div>;

}