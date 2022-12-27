import React from "react";
import {Avatar, Card, Col, DatePicker, List, message, Rate, Row, Space, TimePicker, Typography} from "antd";
import {geekblue, gold, green, red, volcano} from '@ant-design/colors';
import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {ClockCircleTwoTone} from "@ant-design/icons";
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
    // "reactions": {
    //   "url": "https://api.github.com/repos/Plasmaa0/bd_3/issues/2/reactions",
    //   "total_count": 0,
    //   "+1": 0,
    //   "-1": 0,
    //   "laugh": 0,
    //   "hooray": 0,
    //   "confused": 0,
    //   "heart": 0,
    //   "rocket": 0,
    //   "eyes": 0
    // }
    // @ts-ignore
    const cards = data.data.map((entry) => {
        return (
            <Col>
                <Card>
                    <Meta
                        avatar={<Typography.Link href={entry.user.html_url}><Avatar
                            src={entry.user.avatar_url}/></Typography.Link>}
                        title={<Typography.Link href={entry.html_url}>{entry.title}</Typography.Link>}
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
                                <Typography.Text>Assignees:</Typography.Text>
                                <List
                                    dataSource={entry.assignees}
                                    renderItem={(item) => (
                                        // @ts-ignore
                                        <List.Item key={item.login}>
                                            <List.Item.Meta
                                                // @ts-ignore
                                                avatar={<Typography.Link href={item.url}><Avatar src={item.avatar_url}/></Typography.Link>}
                                                // @ts-ignore
                                                title={<Typography.Link href={item.url}>{item.login}</Typography.Link>}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Space>
                        }
                    />
                </Card>
            </Col>
        )
    })
    return (
        <Row justify="space-between" align="middle" gutter={[16, 24]}>
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