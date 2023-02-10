import {Image} from "antd";
import {api_url} from "../../Config";
import {GetToken, GetUser} from "../../Functions/DataStoring";
import React from "react";

export function isImage(file: string) {
    const image_formats = ['jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'svg']
    // check every format
    for (const format of image_formats) {
        if (file.endsWith(format))
            return true;
    }
    return false;
}

export function DisplayImage(user: string, file: string) {
    return <Image src={`${api_url}/file/${user}/` + file + '?' + new URLSearchParams({
        token: GetToken(),
        user: GetUser()
    })}/>;
}