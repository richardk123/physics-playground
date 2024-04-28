import {Autocomplete, TextField} from "@mui/material";
import {createScene1} from "./Scene1";
import {EngineSingleton} from "./EngineSingleton";
import {createScene2} from "./Scene2";
import {Button} from "@material-tailwind/react";
import {useState} from "react";
import {Engine} from "../../../engine/Engine";

interface Scene
{
    label: string,
    create: () => Promise<Engine>;
}
export const SceneControls = ({canvas}: {canvas: HTMLCanvasElement}) =>
{
    const [scene, setScene] = useState<Scene | undefined>(undefined);
    const [running, setRunning] = useState(true);

    const scenes: Scene[] = [
        { label: 'Scene 1', create: () => createScene1(canvas)},
        { label: 'Scene 2', create: () => createScene2(canvas)},
    ];

    const onChange = async (event: React.SyntheticEvent<Element, Event>, scene: Scene | null) =>
    {
        const prevEngine = EngineSingleton.get();
        if (prevEngine)
        {
            await prevEngine.destroy();
        }
        await scene?.create();
        startStopEngine(running);
        if (scene)
        {
            setScene(scene);
        }
    }

    const startStopEngine = async (running: boolean) =>
    {
        const engine = EngineSingleton.get();
        if (engine)
        {
            engine.running = running;
            setRunning(engine.running);
            await engine.next();
            await engine.simulateLoop();
            await engine.renderLoop();
        }
    }

    const startStop = async () =>
    {
        startStopEngine(!running);
    }

    const next = async () =>
    {
        const engine = EngineSingleton.get();
        if (engine)
        {
            await engine.next();
            setRunning(false);
        }
    }

    const reload = async () =>
    {
        const prevEngine = EngineSingleton.get();
        if (prevEngine)
        {
            await prevEngine.destroy();
        }
        if (scene)
        {
            await scene?.create();
        }
        else
        {
            await scenes[0].create();
        }

        startStopEngine(running);
    }

    return <div className="w-full h-12 flex">
        <Autocomplete
            disablePortal
            options={scenes}
            size={"small"}
            sx={{ width: 300 }}
            defaultValue={scenes[0]}
            onChange={onChange}
            isOptionEqualToValue={(option, value) => option.label === value.label}
            renderInput={(params) => <TextField {...params} label="Scene" />}
        />
        <Button variant="filled" size="md" onClick={startStop}>{running ? "Stop" : "Start"}</Button>
        <Button variant="filled" size="md" disabled={running} onClick={next}>Next</Button>
        <Button variant="filled" size="md" onClick={reload}>Reload</Button>
    </div>;
}