import {FloatButton} from "antd";
import {GlobalOutlined} from "@ant-design/icons";
import React from "react";

export function setIsRussianLanguage(isRussian: boolean) {
    localStorage.setItem("isRussianLanguage", isRussian.toString());
}

export function isRussianLanguage() {
    // if local storage is not set, then set it to false
    if (localStorage.getItem("isRussianLanguage") === null) {
        setIsRussianLanguage(true);
    }
    return localStorage.getItem("isRussianLanguage") === "true";
}

export function LanguageSwitcher(props: { isRussian: boolean, setIsRussianLanguage: (isRussianLanguage: boolean) => void }) {
    return <FloatButton
        style={{ right: 94 }}
        tooltip={<div>Switch language</div>}
        icon={<GlobalOutlined/>}
        type={isRussianLanguage() ? "default" : "primary"}
        description={isRussianLanguage() ? "RU" : "EN"}
        onClick={
            () => {
                setIsRussianLanguage(!isRussianLanguage());
                props.setIsRussianLanguage(!props.isRussian);
            }
        }
    />
}