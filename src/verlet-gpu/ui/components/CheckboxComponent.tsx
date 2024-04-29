import {useEffect, useState} from "react";
import {Box} from "@mui/material";
import {Checkbox} from "@material-tailwind/react";

interface Props
{
    value: boolean;
    setValue: (val: boolean) => void;
}

export const CheckboxComponent = (props: Props) =>
{
    return <Box component="form"sx={{'& > :not(style)': { m: 1, width: '25ch' },}}>
        <Checkbox
            checked={props.value}
            onChange={e => props.setValue(e.target.checked)}
        />
    </Box>
}