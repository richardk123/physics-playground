import { NavLink, useLocation } from "react-router-dom";
import React from 'react';

// Simple Icons using SVG directly to avoid adding dependencies if possible, 
// or use Material Icons if available. Using simple SVG shapes for now for "Physics" feel.

const AtomIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12a14.5 14.5 0 0 0 20 0 14.5 14.5 0 0 0-20 0" />
    </svg>
);

const CubeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m21 16-9 4-9-4" />
        <path d="M21 8 12 12 3 8" />
        <path d="M12 12v9" />
        <path d="M12 3 3 8l9 4 9-4-9-4z" />
    </svg>
);

const WaveIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);


export const Sidebar = () => {
    return (
        <div className="flex flex-col h-full text-slate-300">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-physics-primary to-physics-secondary flex items-center justify-center text-white shadow-lg shadow-physics-primary/20">
                        <AtomIcon className="w-6 h-6 animate-spin-slow" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-tight">Physics Lab</h1>
                        <p className="text-xs text-slate-500 font-medium tracking-wide">VERSION 1.0</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                <NavItem to="/" label="Verlet Naive" icon={<CubeIcon />} />
                <NavItem to="/verlet02" label="Verlet Optimized" icon={<CubeIcon />} />

                <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Extended Position
                </div>
                <NavItem to="/xpdb" label="XPBD Basic" icon={<AtomIcon />} />
                <NavItem to="/xpdb2" label="XPBD Optimized" icon={<AtomIcon />} />

                <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Simulations
                </div>
                <NavItem to="/fluid-sim" label="Fluid CPU" icon={<WaveIcon />} />
                <NavItem to="/fluid-gpu" label="Fluid GPU" icon={<WaveIcon />} />
                <NavItem to="/n-body-gpu" label="N-Body GPU" icon={<AtomIcon />} />
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-black/10">
                <div className="text-xs text-center text-slate-600">
                    Built by Richard Kolisek
                </div>
            </div>
        </div>
    );
};

const NavItem = ({ to, label, icon }: { to: string, label: string, icon?: React.ReactNode }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 
                ${isActive
                    ? 'bg-physics-primary/10 text-physics-primary shadow-[0_0_20px_rgba(6,182,212,0.15)] border border-physics-primary/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white hover:pl-4'
                }`
            }
        >
            {({ isActive }) => (
                <>
                    <span className={`mr-3 transition-colors ${isActive ? 'text-physics-primary' : 'text-slate-500 group-hover:text-slate-300'}`}>
                        {icon ? React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" }) : null}
                    </span>
                    {label}
                    {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-physics-primary shadow-[0_0_8px_currentColor]" />
                    )}
                </>
            )}
        </NavLink>
    );
};