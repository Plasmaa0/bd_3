import React from 'react';
import {Link} from "react-router-dom";
import {Button, Menu} from 'antd';


// @ts-ignore
export function Navbar({getUser}) {
    return (
        // @ts-ignore
        <Menu mode="horizontal">
            <Menu.Item key="home">
                <Button type="link">
                    <Link to="/">Home</Link>
                </Button>
            </Menu.Item>
            <Menu.Item key="tree">
                <Button type="link">
                    <Link to={`/class-tree`}>Class tree</Link>
                </Button>
            </Menu.Item>
            <Menu.Item key="search">
                <Button type="link">
                    <Link to="search">Search</Link>
                </Button>
            </Menu.Item>
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
            <Menu.Divider style={{width:'50vw'}}/>
            <Menu.Item key="profile">
                <Button type="link">
                    <Link to={`/${getUser()}`} reloadDocument={true}>Profile: {getUser()}</Link>
                </Button>
            </Menu.Item>
        </Menu>
    );
}