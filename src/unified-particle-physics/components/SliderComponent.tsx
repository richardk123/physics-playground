import {Box, Slider} from "@mui/material";
import {useEffect, useState} from "react";

interface Props
{
    value: number;
    setValue: (val: number) => void;
    minVal: number;
    maxVal: number;
}
export const SliderComponent = (props: Props) =>
{
    const [value, setValue] = useState(props.value);

    useEffect(() =>
    {
        props.setValue(value);
    }, [value]);

    return <Box component="form">
        <Slider
            defaultValue={value}
            valueLabelDisplay="auto"
            step={(props.maxVal - props.minVal) / 100}
            marks
            min={props.minVal}
            max={props.maxVal}
            onChange={(e, v) => setValue(Number(v))}
        />
    </Box>
}