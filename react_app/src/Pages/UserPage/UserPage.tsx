import React, {useEffect, useState} from 'react';
import {Link, useParams} from "react-router-dom";
import {Col, Collapse, Row, Space, Table, Tag, Typography} from "antd";
import {useQuery} from "@tanstack/react-query";
import get from "axios";
import {ClockCircleTwoTone} from "@ant-design/icons"
import {AddProjectForm} from "./addProjectForm";
import {UniqueColorFromString} from "../Util/Utils";
import {DeleteButton} from "../Util/DeleteButton";
import {api_url} from "../../Config";
import {GetToken, GetUser} from "../../Functions/DataStoring";

// @ts-ignore
export function UserPage() {
    const {user} = useParams<string>();
    const [needToRefetch, setNeedToRefetch] = useState(true);
    const {isLoading, error, data, isFetching, refetch} = useQuery(["userPageData"], () =>
        get(api_url + "/dir/" + user + '?' + new URLSearchParams({token: GetToken(), user: GetUser()}))
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
                        <DeleteButton type="rmdir"
                                      setNeedToRefetch={setNeedToRefetch}
                                      user={user}
                                      location={text}/>
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
            },
            {
                title: 'Classes',
                dataIndex: 'classes',
                key: 'classes',
                render: (text: string[]) => {
                    return text.map((item) => {
                        return (
                            <Tag key={item} color={UniqueColorFromString(item)}>{item}</Tag>
                        );
                    });
                }
            }
        ];
        return (
            <div>
                <Row justify="space-between" align="middle" gutter={[16, 24]}>
                    <Col>
                        <Row>
                            <Col>
                                <Typography.Title level={2}>
                                    User page:
                                </Typography.Title>
                            </Col>
                            <Col>
                                <Typography.Title level={2} code={true}>
                                    {user}
                                </Typography.Title>
                            </Col>
                        </Row>
                    </Col>
                    <Col>
                        <Collapse>
                            <Collapse.Panel header="Add project" key="1">
                                <AddProjectForm existingProjects={data} user={user}
                                                setNeedToRefetch={setNeedToRefetch}/>
                            </Collapse.Panel>
                        </Collapse>
                    </Col>
                </Row>
                <Table pagination={{hideOnSinglePage: true}} columns={columns} dataSource={data}></Table>
            </div>)
    }
    return (<div><h1>User page: {user}</h1></div>)
}