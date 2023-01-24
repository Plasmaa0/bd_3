import React from "react";
import {Button, Form, Input, message, Typography} from "antd";
import {api_url} from "../../Config";

async function RegisterUser(username: string, password: string) {
    return fetch(api_url + "/register?" + new URLSearchParams({
        user: username,
        password: password
    }), {
        method: 'POST'
    })
        .catch(error => console.log('error', error));
}

export function Register() {
    // @ts-ignore
    const handleSubmit = async (values: any) => {
        // @ts-ignore
        const response: Response = await RegisterUser(
            // @ts-ignore
            values['username'],
            values['password']
        )
        console.log(response.status)
        const duration = 5;
        if (response.status === 200) {
            message.info(await response.json(), duration);
            // after 5 seconds, redirect to login page
            setTimeout(() => {
                window.location.href = "/login";
            }, duration * 1000)
        } else {
            message.error(await response.json(), duration)
        }
    }

    return (
        <div style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
            <Typography.Title>Registration</Typography.Title>
            <Form
                name="basic"
                labelCol={{span: 8}}
                wrapperCol={{span: 16}}
                validateTrigger="onChange"
                autoComplete="off"
                onFinish={handleSubmit}
            >
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[{required: true, message: "Username is required"},
                        {min: 8, message: ">8 characters"},
                        {max: 20, message: "<20 characters"},
                        {pattern: /^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/, message: "Invalid username"}]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{required: true, message: 'Password is required'},
                        {min: 8, message: '>8 characters'},
                        {max: 20, message: '<20 characters'},
                        {pattern: /^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/, message: 'Invalid password'}]}
                >
                    <Input.Password/>
                </Form.Item>

                <Form.Item
                    label="Repeat Password"
                    name="repeat-password"
                    dependencies={['password']}
                    rules={[
                        {
                            required: true,
                            message: 'Please confirm your password!',
                        },
                        ({getFieldValue}) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('The two passwords that you entered do not match!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password/>
                </Form.Item>

                <Form.Item wrapperCol={{offset: 8, span: 16}}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
            <Button type="link" htmlType="submit">
                <Typography.Link href="/login">Go to login</Typography.Link>
            </Button>
        </div>
    );
}