import {Autocomplete, TextField} from "@mui/material";
import {Button} from "@material-tailwind/react";
import {useState} from "react";
import {Engine} from "../../../engine/Engine";
import {createScenes, Scene} from "../scene/Scenes";

export const SceneControls = ({canvas, engine, onChangeEngine}: {canvas: HTMLCanvasElement, engine: Engine, onChangeEngine: (engine: Engine) => void}) =>
{
    const [scene, setScene] = useState<Scene | undefined>(undefined);
    const [running, setRunning] = useState(true);
    const scenes = createScenes(canvas);

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
        setRunning(running);
        await engine.startLoop();
        if (!running)
        {
            engine.stop();
        }
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