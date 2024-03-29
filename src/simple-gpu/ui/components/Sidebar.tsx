import {Card} from "@material-tailwind/react";
import {AccordionComponent} from "./common/AccordionComponent";
import {SimulationControls} from "./SimulationControls";
import {Engine} from "../../engine/Engine";
import {GpuSettingsInfo} from "./GpuSettingsInfo";
import React from "react";

export const Sidebar = ({engine}: {engine: Engine}) =>
{
    return <Card className="w-full h-full">
        <Card className="w-full">
            <SimulationControls engine={engine} />
        </Card>
        <AccordionComponent expanded={true} label="Settings">
            <GpuSettingsInfo engine={engine} />
        </AccordionComponent>
    </Card>
}