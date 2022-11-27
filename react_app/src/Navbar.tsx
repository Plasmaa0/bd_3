import React from 'react';
import {Link} from "react-router-dom";
import {Button, Menu, Space, Typography} from 'antd';


// @ts-ignore
export function Navbar({getUser}) {
    //fixme add Button's
    const LoggedInFeatures = function () {
        if (getUser())
            return (
                    <Menu.Item key="profile">
                        <Button type="link">
                            <Link to={`/${getUser()}`} reloadDocument={true}>Profile: {getUser()}</Link>
                        </Button>
                    </Menu.Item>
            );
        else
            return (<div></div>)
    }
    return (
        // @ts-ignore
        <Menu mode="horizontal">
            <Menu.Item key="home">
                <Link to="/">Home</Link>
            </Menu.Item>
            <Menu.SubMenu key="auth-menu" title="Auth">
                <Menu.Item key="login">
                    <Button type="link">
                        <Link to="/login">Login</Link>
                    </Button>
                </Menu.Item>
                <Menu.Item key="register">
                    <Button type="link">
                        <Link to="/register">Register</Link>
                    </Button>
                </Menu.Item>
            </Menu.SubMenu>
            <Menu.Item key="search">
                <Button type="link">
                    <Link to="search">Search</Link>
                </Button>
            </Menu.Item>
            <LoggedInFeatures/>
        </Menu>
    );
}