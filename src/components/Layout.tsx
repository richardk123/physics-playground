import { Sidebar } from "./Sidebar";
import React from "react";
import { Outlet } from "react-router-dom";

export const Layout = () => {
    return (
        <div className="flex h-screen w-full bg-physics-bg overflow-hidden relative selection:bg-physics-primary selection:text-physics-bg">
            {/* Ambient Dynamic Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                {/* Deep Space Gradient Base */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] to-[#1e1b4b]"></div>

                {/* Animated Orbs */}
                <div className="absolute top-0 left-[-10%] w-[40rem] h-[40rem] bg-physics-primary/20 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob" />
                <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-32 left-[20%] w-[45rem] h-[45rem] bg-physics-secondary/20 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob animation-delay-4000" />
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