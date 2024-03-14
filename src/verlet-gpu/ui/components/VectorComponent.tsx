import {Box, TextField} from "@mui/material";
import {useEffect, useState} from "react";
import {Vec2d} from "../../engine/data/Vec2d";

export const VectorComponent = (props: {vector: Vec2d, change: (vector: Vec2d) => void}) =>
{
    const [x, setX] = useState(props.vector.x);
    const [y, setY] = useState(props.vector.y);

    useEffect(() =>
    {
        props.change({x: x, y: y});
    }, [x, y, props])

    return <Box component="form" sx={{'& > :not(style)': { m: 1, width: '12ch' },}}>
        <TextField label="X:" variant="standard" type="number" defaultValue={x}
                   onChange={e => setX(Number(e.target.value))} />
        <TextField label="Y:" variant="standard" type="number" defaultValue={y}
                   onChange={e => setY(Number(e.target.value))} />
    </Box>
}