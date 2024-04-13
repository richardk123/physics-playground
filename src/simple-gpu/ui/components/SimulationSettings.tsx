import {BoxTitle} from "../../../verlet-gpu/ui/components/BoxTitle";
import {SliderComponent} from "../../../verlet-gpu/ui/components/SliderComponent";
import React from "react";
import {Engine} from "../../engine/Engine";
import {CheckboxComponent} from "../../../verlet-gpu/ui/components/CheckboxComponent";

export const SimulationSettings = ({engine}: {engine: Engine}) =>
{
    const settings = engine.solver.settingsBuffer.settings;

    return <>
        <BoxTitle label="Debug enabled">
            <CheckboxComponent value={settings.debug}
                               setValue={e => settings.debug = e} />
        </BoxTitle>
        <BoxTitle label="Sub-step count">
            <SliderComponent value={settings.subStepCount}
                             setValue={val => settings.subStepCount = val}
                             step={1}
                             minVal={1}
                             maxVal={100} />
        </BoxTitle>
        <BoxTitle label="Gravity">
            <SliderComponent value={settings.gravity.x}
                             setValue={val => settings.gravity.x = val}
                             minVal={-10}
                             maxVal={10}
                             step={1}/>
            <SliderComponent value={settings.gravity.y}
                             setValue={val => settings.gravity.y = val}
                             minVal={-10}
                             maxVal={10}
                             step={1} />
        </BoxTitle>
        <BoxTitle label="Simulations per second">
            <SliderComponent value={1 / settings.deltaTime}
                             setValue={val => settings.deltaTime = 1 / val}
                             step={1}
                             minVal={30}
                             maxVal={120} />
        </BoxTitle>
    </>
}