import React from "react";
import get from "axios";
import {Button, message, Popconfirm} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import {api_url} from "../ClassTree/Config";
import {GetToken, GetUser} from "../../Functions/DataStoring";

// @ts-ignore
export function DeleteButton({setNeedToRefetch, user, location, type}) {
    const confirm = async () => {
        const s = await get(api_url + `/${type}/` + user + '/' + location + '?' + new URLSearchParams({
            token: GetToken(),
            user: GetUser()
        })).then(value => value.data).catch(value => value.response)
        if (s.data) {
            message.error(s.data)
        } else {
            message.success(`Removed ${location}`)
            setNeedToRefetch(true)
        }
    }
    const cancel = async () => {
        message.info('Nothing was deleted')
    }
    return (
        <Popconfirm title="Are you sure? It will delete everything recursively."
                    onConfirm={confirm}
                    onCancel={cancel}
                    okType="danger"
                    okText="Yes"
                    cancelText="No">
            <Button danger>
                <DeleteOutlined/>
            </Button>
        </Popconfirm>
    )
}