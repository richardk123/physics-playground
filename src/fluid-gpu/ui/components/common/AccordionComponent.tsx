import {Accordion, AccordionDetails, styled} from "@mui/material";
import MuiAccordionSummary, {
    AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface Props
{
    label: string;
    expanded: boolean;
    children?: React.ReactNode;
}
export const AccordionComponent = (props: Props) =>
{

    const AccordionSummary = styled((props: AccordionSummaryProps) => (
        <MuiAccordionSummary
            expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
            {...props}
        />
    ))(({ theme }) => ({
        backgroundColor:
            theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, .05)'
                : 'rgba(0, 0, 0, .03)',
    }));

    return <Accordion defaultExpanded={props.expanded} disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            {props.label}
        </AccordionSummary>
        <AccordionDetails>
            <div className="p-2">
                {props.children}
            </div>
        </AccordionDetails>
    </Accordion>
}