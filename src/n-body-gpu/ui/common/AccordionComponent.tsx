import { Accordion, AccordionDetails, styled } from "@mui/material";
import MuiAccordionSummary, {
    AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface Props {
    label: string;
    expanded: boolean;
    children?: React.ReactNode;
}
export const AccordionComponent = (props: Props) => {

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

    return <Accordion
        defaultExpanded={props.expanded}
        disableGutters
        sx={{
            borderRadius: '0px',
            overflow: 'visible', // Allow dropdowns to overflow
            background: 'transparent',
            boxShadow: 'none',
            '&:before': { display: 'none' },
            '& .MuiAccordionSummary-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                minHeight: '48px',
                paddingLeft: '16px',
            }
        }}
    >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />}>
            <span className="text-sm font-semibold tracking-wide text-slate-200">{props.label}</span>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 0 }}>
            <div className="p-4 flex flex-col gap-3 bg-transparent">
                {props.children}
            </div>
        </AccordionDetails>
    </Accordion>
}