import {Autocomplete, TextField} from "@mui/material";
import {createScene1} from "../scene/Scene1";
import {createScene2} from "../scene/Scene2";
import {Button} from "@material-tailwind/react";
import {useState} from "react";
import {Engine} from "../../../engine/Engine";

interface Scene
{
    label: string,
    create: () => Promise<Engine>;
}
export const SceneControls = ({canvas, engine, onChangeEngine}: {canvas: HTMLCanvasElement, engine: Engine, onChangeEngine: (engine: Engine) => void}) =>
{
    const [scene, setScene] = useState<Scene | undefined>(undefined);
    const [running, setRunning] = useState(true);

    const scenes: Scene[] = [
        { label: 'Scene 1', create: () => createScene1(canvas)},
        { label: 'Scene 2', create: () => createScene2(canvas)},
    ];

    const onChange = async (event: React.SyntheticEvent<Element, Event>, scene: Scene | null) =>
    {
        await engine.destroy();
        if (scene)
        {
            const newEngine = await scene.create();
            await startStopEngine(running, newEngine);
            setScene(scene);
            onChangeEngine(newEngine);
        }
    }

    const startStopEngine = async (running: boolean, engine: Engine) =>
    {
        engine.running = running;
        setRunning(engine.running);
        await engine.next();
        await engine.simulateLoop();
        await engine.renderLoop();
    }

    const startStop = async () =>
    {
        startStopEngine(!running, engine);
    }

    const next = async () =>
    {
        await engine.next();
        setRunning(false);
    }

    const reload = async () =>
    {
        await engine.destroy();
        const newEngine = scene ? await scene.create() : await scenes[0].create();
        await startStopEngine(running, newEngine);
        onChangeEngine(newEngine);
    }

    return (
        <div className="w-full">
            <div className="w-full h-12">
                <Autocomplete
                    disablePortal
                    options={scenes}
                    size={"small"}
                    sx={{ width: 255 }}
                    defaultValue={scenes[0]}
                    onChange={onChange}
                    isOptionEqualToValue={(option, value) => option.label === value.label}
                    renderInput={(params) => <TextField {...params} label="Scene" />}
                />
            </div>
            <div className="w-full flex">
                <Button variant="filled" size="md" onClick={startStop}>{running ? "Stop" : "Start"}</Button>
                <Button variant="filled" size="md" disabled={running} onClick={next}>Next</Button>
                <Button variant="filled" size="md" onClick={reload}>Reload</Button>
            </div>
        </div>
);
}