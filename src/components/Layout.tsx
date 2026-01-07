import { Sidebar } from "./Sidebar";
import React from "react";
import { Outlet } from "react-router-dom";

export const Layout = () => {
    return (
        <div className="flex h-screen w-full bg-physics-bg overflow-hidden relative selection:bg-physics-primary selection:text-physics-bg">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-physics-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-physics-secondary/10 rounded-full blur-[120px]" />
            </div>

            {/* Sidebar */}
            <div className="relative z-10 w-72 h-full border-r border-white/5 bg-physics-surface/30 backdrop-blur-xl">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 scroll-smooth">
                    <div className="max-w-7xl mx-auto h-full">
                        <div className="bg-physics-surface/40 backdrop-blur-md border border-white/10 rounded-2xl h-full shadow-2xl p-1 overflow-hidden">
                            <div className="h-full w-full rounded-xl overflow-hidden bg-black/20">
                                <Outlet />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};