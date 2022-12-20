import React, {useState} from "react";
import {Button, Upload} from "antd";
import {DownloadOutlined} from "@ant-design/icons";
import {SizeType} from "antd/es/config-provider/SizeContext";

function fetchProjectData() {

}

export function DownloadProject() {
    return (
        <Button type="primary"
                shape="round"
                icon={<DownloadOutlined/>}
                size='middle'
                onClick={fetchProjectData}
        >
            Download
        </Button>
    )
}