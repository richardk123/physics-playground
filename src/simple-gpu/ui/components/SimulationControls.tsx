import {Engine} from "../../engine/Engine";
import {Button} from "@material-tailwind/react";
import {useState} from "react";

interface Props
{
    engine?: Engine;
}
export const SimulationControls = (props: Props) =>
{
    const [running, setRunning] = useState(props.engine?.running ?? false);
    const stop = () =>
    {
        props.engine!.stop();
        setRunning(false);
    }
    const start = async () =>
    {
        await props.engine!.simulate();
        setRunning(true);
    }
    const next = async () =>
    {
        await props.engine!.next();
        setRunning(false);
    }
    return <>
        <Button variant="filled" disabled={!running} onClick={stop}>Stop</Button>
        <Button variant="filled" disabled={running} onClick={start}>Start</Button>
        <Button variant="filled" disabled={running} onClick={next}>Next</Button>
    </>
}