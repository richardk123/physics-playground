import {Sidebar} from "./Sidebar";
import React from "react";
import {Outlet} from "react-router-dom";

export const Layout = () =>
{
    return <>
        <div className="flex h-screen bg-gray-200">

            <div className="w-64 text-white">
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-hidden p-4 h-full w-full">
                    <Outlet/>
                </main>
            </div>
        </div>
    </>
}