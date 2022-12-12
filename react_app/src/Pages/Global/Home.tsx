import React from "react";
import {Image, message, Rate, Space, Typography} from "antd";
import {StarOutlined} from "@ant-design/icons"

export function Home() {
    return (
        <div>
            <Typography.Title>HOME PAGE</Typography.Title>
            <Space direction="vertical">
                <Space>
                    <StarOutlined style={{fontSize: '200px'}}/>
                    <StarOutlined spin style={{fontSize: '200px', backgroundImage: 'url("https://sun1-16.userapi.com/impf/c855436/v855436057/3fa51/08qfq3LqgYg.jpg?size=1627x2160&quality=96&sign=d64000766e16cae103c296f5c2955b8c&type=album")'}}/>
                    <StarOutlined style={{fontSize: '200px'}}/>
                </Space>
                <Space direction="vertical">
                    <Typography.Text>Rate site</Typography.Text>
                    <Rate onChange={() => message.success('Thank you!')}/>
                    <Image width={200} src="https://sun1-16.userapi.com/impf/c855436/v855436057/3fa51/08qfq3LqgYg.jpg?size=1627x2160&quality=96&sign=d64000766e16cae103c296f5c2955b8c&type=album"/>
                </Space>
            </Space>
        </div>
    );
}