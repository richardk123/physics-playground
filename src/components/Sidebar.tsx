import {Card, List, ListItem} from "@material-tailwind/react";
import {NavLink} from "react-router-dom";
import { useLocation } from 'react-router-dom';
export const Sidebar = () =>
{
    const location = useLocation();

    const isSelected = (name: string) =>
    {
        return name === location.pathname;
    }

    const createLink = (url: string, name: string) =>
    {
        const prefixUrl = "/physics-playground" + url;
        return (
            <NavLink to={prefixUrl}>
                <ListItem selected={isSelected(prefixUrl)}>
                    {name}
                </ListItem>
            </NavLink>
        );
    }

    return (<Card id="sidebar" className="h-[calc(100vh-2rem)] w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5">
        <List>
            {createLink("/", "Verlet Integration naive")}
            {createLink("/verlet02", "Verlet Integration optimalized")}
        </List>
    </Card>);
}