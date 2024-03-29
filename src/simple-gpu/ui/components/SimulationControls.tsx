import {Engine} from "../../engine/Engine";
import {Button} from "@material-tailwind/react";
import {useState} from "react";

interface Props
{
    engine: Engine;
}
export const SimulationControls = (props: Props) =>
{
    const [running, setRunning] = useState(props.engine.running);
    const startStop = async () =>
    {
        props.engine.running = !running;
        setRunning(!running);
        await props.engine.simulate();
    }
    const next = async () =>
    {
        await props.engine!.next();
        setRunning(false);
    }
    return <div className="flex">
        <Button variant="filled" onClick={startStop}>{running ? "Stop" : "Start"}</Button>
        <Button variant="filled" disabled={running} onClick={next}>Next</Button>
    </div>
}