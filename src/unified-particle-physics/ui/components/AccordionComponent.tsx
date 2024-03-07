import {Accordion, AccordionDetails, AccordionSummary, Box, TextField} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface Props
{
    label: string;
    expanded: boolean;
    children?: React.ReactNode;
}
export const AccordionComponent = (props: Props) =>
{
    return <Accordion defaultExpanded={props.expanded} disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            {props.label}
        </AccordionSummary>
        <AccordionDetails>
            {props.children}
        </AccordionDetails>
    </Accordion>
}