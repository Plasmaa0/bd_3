import React from "react";
import {
    Avatar,
    Button,
    Card,
    Col,
    DatePicker,
    message,
    notification,
    Rate,
    Row,
    Space,
    TimePicker,
    Tooltip,
    Typography
} from "antd";
import {geekblue, gold, green, red, volcano} from '@ant-design/colors';
import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {ClockCircleTwoTone, EyeOutlined} from "@ant-design/icons";
import Meta from "antd/es/card/Meta";
import dayjs from "dayjs";

function GitHubIssues() {
    const {isLoading, isFetching, isPaused, error, data} = useQuery(
        {
            queryKey: ["githubIssues"],
            queryFn: async () => {
                return await axios.get("https://api.github.com/repos/plasmaa0/bd_3/issues")
            }
        }
    )
    if (isPaused) return (<Typography.Text>Paused</Typography.Text>);
    if (isLoading) return (<ClockCircleTwoTone spin twoToneColor={"lime"} style={{fontSize: '50px'}}/>);
    if (isFetching) return (<ClockCircleTwoTone spin twoToneColor={"lime"} style={{fontSize: '50px'}}/>);
    if (error) { // @ts-ignore
        return (<Typography.Text>Failed to load GitHub issues :(</Typography.Text>);
    }
    // @ts-ignore
    const cards = data.data.map((entry) => {
        return (
            <Col xs={24} sm={24} md={12} lg={8} xl={6} xxl={4}>
                <Card
                    hoverable
                    actions={[
                        // open github issue
                        <Typography.Link href={entry.html_url} target="_blank">Open on Github</Typography.Link>
                    ]}
                >
                    <Meta
                        avatar={
                            <Space direction="vertical">
                                <Typography.Link href={entry.user.html_url}>
                                    <Avatar src={entry.user.avatar_url}/>
                                </Typography.Link>

                                <Tooltip title="See more" placement="bottomRight">
                                    <Button icon={<EyeOutlined/>} onClick={() => {
                                        notification.open({
                                            message: entry.title,
                                            description: entry.body,
                                            duration: 0,
                                            placement: "bottomRight",
                                            type: "info"
                                        })
                                    }}/>
                                </Tooltip>
                            </Space>
                        }
                        title={
                            <Tooltip title={entry.title} placement="topLeft">
                                <Typography.Link href={entry.html_url} target="_blank">
                                    {entry.title}
                                </Typography.Link>
                            </Tooltip>
                        }
                        description={
                            <Space direction="vertical">
                                <Space>
                                    <Typography.Text>State: </Typography.Text>
                                    <Typography.Text code={true}>{entry.state}</Typography.Text>
                                </Space>
                                <Row justify="space-between" align="middle" gutter={[8, 8]}>
                                    <Col>
                                        <Typography.Text>Created at:</Typography.Text>
                                    </Col>
                                    <Col>
                                        <DatePicker defaultValue={dayjs(entry.created_at, 'YYYY-MM-DD')}
                                                    disabled/>
                                        <TimePicker defaultValue={dayjs(entry.created_at, 'HH:mm:ss')} disabled/>
                                    </Col>
                                </Row>
                                {entry.assignees.length > 0 &&
                                    <div>
                                        <Typography.Text>Assignees:</Typography.Text>
                                        {/*// if only one assignee use Avatar, else use Avatar.Group*/}
                                        {entry.assignees.length === 1 ?
                                            <Typography.Link href={entry.assignees[0].html_url}><Avatar
                                                src={entry.assignees[0].avatar_url}/></Typography.Link> :
                                            <Avatar.Group maxCount={2}
                                                          maxStyle={{color: '#f56a00', backgroundColor: '#fde3cf'}}>
                                                {/*// @ts-ignore*/}
                                                {entry.assignees.map((assignee) => {
                                                    return <Typography.Link href={assignee.html_url}><Avatar
                                                        src={assignee.avatar_url}/></Typography.Link>
                                                })}
                                            </Avatar.Group>
                                        }
                                    </div>
                                }
                            </Space>
                        }/>
                </Card>
            </Col>
        )
    })
    return (
        <Row justify="space-evenly" gutter={[16, 24]}>
            {cards}
        </Row>
    )
}

export function Home() {
    let color = [
        geekblue[2],
        green[2],
        gold[2],
        volcano[2],
        red[2]
    ];
    return (
        <Space direction="vertical">
            <Typography.Title>HOME PAGE</Typography.Title>
            <Space direction="vertical">
                <GitHubIssues/>
                <Space direction="vertical">
                    <Typography.Text>Rate site</Typography.Text>
                    <Rate onChange={() => message.success('Thank you!')}/>
                </Space>
            </Space>
        </Space>
    );
}