import {Engine} from "../../../engine/Engine";
import {Material} from "../../../engine/data/Material";
import React from "react";
import {BoxTitle} from "../common/BoxTitle";
import {Typography} from "@mui/material";
import {Card} from "@material-tailwind/react";
import {SliderComponent} from "../common/SliderComponent";

export const MaterialControls = ({engine}: {engine: Engine}) =>
{
    const materials = engine.solver.materialsBuffer.materials.materials;

    const renderMaterial = (material: Material, index: number) =>
    {
        return <Card key={index} variant="gradient" className="mb-2 p-1">
                <Typography variant="subtitle1">Material: {index}</Typography>
                <div className="px-2">
                    <BoxTitle label="Pressure multiplier">
                        <SliderComponent value={material.pressureMultiplier}
                                         setValue={val => material.pressureMultiplier = val}
                                         minVal={1}
                                         maxVal={100}
                                         step={1}/>
                    </BoxTitle>
                    <BoxTitle label="Target density">
                        <SliderComponent value={material.targetDensity}
                                         setValue={val => material.targetDensity = val}
                                         minVal={1}
                                         maxVal={5}
                                         step={0.05}/>
                    </BoxTitle>
                    <BoxTitle label="Smoothing radius">
                        <SliderComponent value={material.smoothingRadius}
                                         setValue={val => material.smoothingRadius = val}
                                         minVal={1}
                                         maxVal={3}
                                         step={0.05}/>
                    </BoxTitle>
                </div>
            </Card>;
    }

    return <div className="w-full h-full">
        {materials.map(renderMaterial)}
    </div>
}