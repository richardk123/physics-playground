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
    const [value, setValue] = useState(props.value);

    return <Box component="form"sx={{'& > :not(style)': { m: 1, width: '25ch' },}}>
        <Checkbox
            defaultChecked={value}
            onChange={e =>
            {
                props.setValue(e.target.checked)
                setValue(e.target.checked);
            }}
        />
    </Box>
}