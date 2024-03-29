import {Box, Typography} from "@mui/material";

interface Props
{
    label: string;
    children?: React.ReactNode;
}
export const BoxTitle = (props: Props) =>
{
    return (
        <Box>
            <Typography variant="subtitle2">{props.label}</Typography>
            {props.children}
        </Box>
    )
}