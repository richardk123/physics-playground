import {Card} from "@material-tailwind/react";
import {AccordionComponent} from "./common/AccordionComponent";
import {SimulationControls} from "./SimulationControls";
import {Engine} from "../../engine/Engine";
import {SettingsInfo} from "./SettingsInfo";
import React from "react";
import {SimulationSettings} from "./SimulationSettings";
import {TimeMeasurements} from "./TimeMeasurements";

export const Sidebar = ({engine}: {engine: Engine}) =>
{
    return <Card className="w-full h-full">
        <Card className="w-full">
            <SimulationControls engine={engine} />
        </Card>
        <AccordionComponent expanded={true} label="Settings">
            <SettingsInfo engine={engine} />
        </AccordionComponent>
        <AccordionComponent expanded={true} label="Performance">
            <TimeMeasurements engine={engine} />
        </AccordionComponent>
        <AccordionComponent expanded={true} label="Simulation settings">
            <SimulationSettings engine={engine} />
        </AccordionComponent>
    </Card>
}