import {Accordion, AccordionDetails, AccordionSummary, Box, TextField} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface Props
{
    label: string;
    children?: React.ReactNode;
}
export const AccordionComponent = (props: Props) =>
{
    return <Accordion defaultExpanded disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            {props.label}
        </AccordionSummary>
        <AccordionDetails>
            {props.children}
        </AccordionDetails>
    </Accordion>
}