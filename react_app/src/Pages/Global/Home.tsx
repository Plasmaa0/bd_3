import React from "react";
import {Card, List, message, notification, Progress, Rate, Space, Typography} from "antd";
import {geekblue, gold, green, red, volcano} from '@ant-design/colors';

const TODOs = [
    // EXAMPLE
    // {
    //     importance: NUMBER IN RANGE [0, 10],
    //     text: *description of task*
    // },
    {
        importance: 6,
        text: 'LDAP'
    },
    {
        importance: 8,
        text: 'Выбор где хранить данные проекта',
    },
    {
        importance: 3,
        text: 'Русский язык',
    },
    {
        importance: 4,
        text: 'Кнопка выхода из аккаунта',
    },
    {
        importance: 10,
        text: 'Test',
    }
];

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
                <List
                    grid={{
                        gutter: 16,
                        xs: 1,
                        sm: 2,
                        md: 4,
                        lg: 4,
                        xl: 6,
                        xxl: 3,
                    }}
                    dataSource={TODOs}
                    renderItem={(item) => (
                        <List.Item>
                            <Card title={item.text} onClick={() => notification.info({message:"Описание", description:item.text})}>
                                <div>Важность: <Progress steps={5} strokeColor={color} status="active"
                                                         percent={item.importance * 10}/></div>
                            </Card>
                        </List.Item>
                    )}
                />
                <Space direction="vertical">
                    <Typography.Text>Rate site</Typography.Text>
                    <Rate onChange={() => message.success('Thank you!')}/>
                </Space>
            </Space>
        </Space>
    );
}