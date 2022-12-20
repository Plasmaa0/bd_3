import React from "react";
import get from "axios";
import {Button, message, Popconfirm} from "antd";
import {DeleteOutlined} from "@ant-design/icons";

// @ts-ignore
export function DeleteButton({getToken, getUser, setNeedToRefetch, user, location, type}) {
    const confirm = async () => {
        const s = await get(`http://virtual.fn11.bmstu.ru:3006/${type}/` + user + '/' + location + '?' + new URLSearchParams({
            token: getToken(),
            user: getUser()
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