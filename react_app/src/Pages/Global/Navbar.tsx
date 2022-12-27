import React from 'react';
import {Link} from "react-router-dom";
import {Button, Menu, Tooltip} from 'antd';
import {
    DatabaseOutlined,
    FileSearchOutlined,
    HomeOutlined,
    KeyOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ProfileOutlined,
    SlidersOutlined
} from "@ant-design/icons";
import {GetUser, logout} from "../../Functions/DataStoring";

// @ts-ignore
export function Navbar({collapsed, setCollapsed}) {
    return (
        <Menu mode="inline" style={{height: "100%"}}>
            <Menu.Item key="burger" icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>} onClick={
                () => {
                    setCollapsed(!collapsed)
                }}>
                <Button type="link">
                    {collapsed ? "Open Menu" : "Close Menu"}
                </Button>
            </Menu.Item>
            <Menu.Item key="home" icon={<HomeOutlined/>}>
                <Button type="link">
                    <Link to="/">Home</Link>
                </Button>
            </Menu.Item>
            <Menu.Item key="profile" icon={<ProfileOutlined/>} title="Profile">
                <Tooltip title="Profile" placement="right">
                    <Button type="link">
                        <Link to={`/${GetUser()}`} reloadDocument={true}>{GetUser()}</Link>
                    </Button>
                </Tooltip>
            </Menu.Item>
            <Menu.SubMenu key="auth" title="Auth" icon={<KeyOutlined/>}>
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
                <Menu.Item key="logout">
                    <Button type="link" onClick={logout}>
                        Logout
                    </Button>
                </Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu key="tools" title="Tools" icon={<SlidersOutlined/>}>
                <Menu.Item key="tree" icon={<DatabaseOutlined/>}>
                    <Button type="link">
                        <Link to={`/class-tree`}>Class tree</Link>
                    </Button>
                </Menu.Item>
                <Menu.Item key="search" icon={<FileSearchOutlined/>}>
                    <Button type="link">
                        <Link to="search">Search</Link>
                    </Button>
                </Menu.Item>
            </Menu.SubMenu>
        </Menu>
    );
}