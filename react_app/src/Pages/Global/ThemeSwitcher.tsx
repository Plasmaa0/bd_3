import {FloatButton} from "antd";
import {BulbOutlined} from "@ant-design/icons";
import React from "react";

export function setIsDarkTheme(isDarkTheme: boolean) {
    localStorage.setItem("isDarkTheme", isDarkTheme.toString());
}

export function isDarkTheme() {
    // if local storage is not set, then set it to false
    if (localStorage.getItem("isDarkTheme") === null) {
        setIsDarkTheme(false);
    }
    return localStorage.getItem("isDarkTheme") === "true";
}

export function ThemeSwitcher(props: { isDarkTheme: boolean, setIsDarkTheme: (isDarkTheme: boolean) => void }) {
    return <FloatButton
        tooltip={<div>Switch theme</div>}
        icon={<BulbOutlined/>}
        type={isDarkTheme() ? "primary" : "default"}
        onClick={
            () => {
                setIsDarkTheme(!isDarkTheme());
                props.setIsDarkTheme(!props.isDarkTheme);
            }
        }
    />;
}