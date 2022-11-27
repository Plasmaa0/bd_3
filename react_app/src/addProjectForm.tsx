import React from "react";
import {Form, Input, Button, Typography, message} from "antd";
import {useMutation} from "@tanstack/react-query";
import get from "axios";

// @ts-ignore
export function AddProjectForm({existingProjects, user, getToken, setNeedToRefetch, loc = ''}) {
    // TODO validate that name not in existingProjects
    const handleSubmit = async (values: any) => {
        // alert("adding new project " + values['name'])
        var path = ''
        if (loc.length > 0) {
            path = "http://127.0.0.1:8000/mkdir/" + user + '/' + loc + '/' + values['name'] + '?' + new URLSearchParams({
                token: getToken(),
                tags: values['tags']
            })
        } else {
            path = "http://127.0.0.1:8000/mkdir/" + user + '/' + values['name'] + '?' + new URLSearchParams({
                token: getToken(),
                tags: values['tags']
            })
        }
        const s = await get(path)
            .then((res) => res.status)
        if (s === 200) {
            setNeedToRefetch(true)
            message.success(`Added new project ${values['name']}`)
        }
    }
    return (
        <Form
            name="basic"
            labelCol={{span: 8}}
            wrapperCol={{span: 16}}
            validateTrigger="onChange"
            autoComplete="off"
            onFinish={handleSubmit}
        >
            <Form.Item
                label="Name"
                name="name"
                rules={[{required: true, message: "name is required"},
                    {pattern: /^(?=[a-zA-Z0-9._]{3,60}$)(?!.*[_.]{2})[^_.].*[^_.]$/, message: "invalid name"}]}
            >
                <Input/>
            </Form.Item>
            <Form.Item
                label="Tags"
                name="tags"
            >
                <Input/>
            </Form.Item>
            <Form.Item wrapperCol={{offset: 8, span: 16}}>
                <Button type="primary" htmlType="submit">
                    Add
                </Button>
            </Form.Item>
        </Form>
    );
}