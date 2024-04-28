import {Card} from "@material-tailwind/react";
import {AccordionComponent} from "./common/AccordionComponent";
import {SettingsInfo} from "./SettingsInfo";
import React from "react";
import {TimeMeasurements} from "./TimeMeasurements";

export const Sidebar = () =>
{
    return <Card className="w-full h-full">
        <AccordionComponent expanded={true} label="Settings">
            <SettingsInfo />
        </AccordionComponent>
        <AccordionComponent expanded={true} label="Performance">
            <TimeMeasurements />
        </AccordionComponent>
        <AccordionComponent expanded={true} label="Simulation settings">
            {/*<SimulationSettings engine={engine} />*/}
        </AccordionComponent>
    </Card>
}