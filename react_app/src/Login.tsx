import React, {useState} from "react";
import {Link, useNavigate, redirect} from "react-router-dom";
import {Form, Input, Button, Typography, message} from "antd";
import Title from "antd/es/skeleton/Title";

async function loginUser(username: string, password: string) {
    return fetch("http://127.0.0.1:8000/login?" + new URLSearchParams({
        user: username,
        password: password
    }), {
        method: 'GET'
    })
        .then(result => result.json())
        .catch(error => console.log('error', error));
}

// @ts-ignore
export function Login({setToken, setUser}) {
    const navigate = useNavigate()
    const handleSubmit = async (values: any) => {
        if (!canSubmit(values)) {
            console.log("not trying to log")
            return;
        }
        const jsonData = await loginUser(
            // @ts-ignore
            values['username'],
            values['password']
        );
        // @ts-ignore
        const token = await jsonData['token'];
        console.log(jsonData)
        if (!token) {
            message.error(await jsonData);
        } else {
            message.success("successful login")
            setToken(token);
            setUser(values['username']);
            navigate('/');
        }
    }
    const isPasswordCorrect = function (values: any) {
        if (!values['password']) {
            return false;
        } else if (values['password'].length < 8) {
            return false;
        } else return new RegExp(/^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/).test(values['password']);
    }

    const isUsernameCorrect = function (values: any) {
        if (!values['username']) {
            return false;
        } else if (values['username'].length < 8) {
            return false;
        } else return new RegExp(/^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/).test(values['username']);
    }

    const canSubmit = function (values: any) {
        return isPasswordCorrect(values) && isUsernameCorrect(values);
    }

    return (
        <div style={{display:"flex", alignItems:"center", flexDirection:"column"}}>
            <Typography.Title>Please Log In</Typography.Title>
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
                    rules={[{required: true, message: "username is required"},
                        {min: 8, message: ">8 characters"},
                        {max: 20, message: "<20 characters"},
                        {pattern: /^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/, message: "invalid username"}]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{required: true, message: "password is required"},
                        {min: 8, message: ">8 characters"},
                        {max: 20, message: "<20 characters"},
                        {pattern: /^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/, message: "invalid password"}]}
                >
                    <Input.Password/>
                </Form.Item>

                <Form.Item wrapperCol={{offset: 8, span: 16}}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
            <Button type="link">
                <Typography.Link href="/register">Or register</Typography.Link>
            </Button>
        </div>
    );
}