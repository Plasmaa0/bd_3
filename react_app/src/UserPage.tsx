import React, {useState, useEffect} from 'react';
import {Link, useParams} from "react-router-dom";
import {Table, Typography, Tag, Button, message, Space, Collapse} from "antd";
import {useQuery} from "@tanstack/react-query";
import get from "axios";
import {ClockCircleTwoTone, DeleteOutlined} from "@ant-design/icons"
import {AddProjectForm} from "./addProjectForm";
import {UniqueColorFromString} from "./Utils";

// @ts-ignore
export function UserPage({getToken, getUser}) {
    const {user} = useParams<string>();
    const [needToRefetch, setNeedToRefetch] = useState(true);
    const {isLoading, error, data, isFetching, refetch} = useQuery(["userPageData"], () =>
        get("http://127.0.0.1:8000/dir/" + user + '?' + new URLSearchParams({token: getToken(), user: getUser()}))
            .then((res) => res.data)
    );
    useEffect(() => {
        if (needToRefetch)
            refetch().then((res) => res.data);
        setNeedToRefetch(false);
    }, [needToRefetch]);

    if (isLoading) return (
        <div>
            <Typography.Title>User page: {user}</Typography.Title>
            {/*<Typography.Text>Loading...</Typography.Text>*/}
            <ClockCircleTwoTone spin twoToneColor={"lime"} style={{fontSize: '50px'}}/>
        </div>);
    if (isFetching) return (
        <div>
            <Typography.Title>User page: {user}</Typography.Title>
            {/*<Typography.Text>Fetching...</Typography.Text>*/}
            <ClockCircleTwoTone spin twoToneColor={"lime"} style={{fontSize: '50px'}}/>
        </div>);
    if (error) return (
        <div>
            <Typography.Title>User page: {user}</Typography.Title>
            {/*// @ts-ignore*/}
            <Typography.Text>{error.response.data}</Typography.Text>
        </div>);

    if (user != null && data) {
        const columns = [
            {
                title: 'Project Name',
                dataIndex: 'name',
                key: 'name',
                render: (text: string) =>
                    <Space size="middle" direction="horizontal"
                           style={{display: "flex", justifyContent: "space-between"}}>
                        <Link to={text} onClick={() => {
                            setNeedToRefetch(true);
                        }}>
                            {text}
                        </Link>
                        <Button danger onClick={async event => {
                            const s = await get("http://127.0.0.1:8000/rmdir/" + user + '/' + text + '?' + new URLSearchParams({
                                token: getToken(),
                                user: getUser()
                            }))
                                .then((res) => res.status)
                            if (s === 200) {
                                setNeedToRefetch(true)
                                message.success(`Removed ${text}`)
                            }
                        }}>
                            <DeleteOutlined/>
                        </Button>
                    </Space>
            },
            {
                title: 'Tags',
                dataIndex: 'tags',
                key: 'tags',
                render: (text: string) => {
                    return text.split(',').map((item) => {
                        return (
                            <Tag key={item} color={UniqueColorFromString(item)}>{item}</Tag>
                        );
                    });
                }
            }
        ];
        return (
            <div>
                <Space size="middle" direction="horizontal" style={{display: "flex", justifyContent: "space-between"}}>
                    <Typography.Title>User page: {user}</Typography.Title>
                    <Collapse>
                        <Collapse.Panel header="Add project" key="1">
                            <AddProjectForm existingProjects={data} user={user} setNeedToRefetch={setNeedToRefetch}
                                            getToken={getToken} getUser={getUser}/>
                        </Collapse.Panel>
                    </Collapse>
                </Space>
                <Table pagination={false} columns={columns} dataSource={data}></Table>
            </div>)
    }
    return (<div><h1>User page: {user}</h1></div>)
}