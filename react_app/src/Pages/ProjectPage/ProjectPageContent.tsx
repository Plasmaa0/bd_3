import {Space, Table} from "antd";
import React from "react";

export function ProjectPageContent(props: { data: any, columns: ({ dataIndex: string; title: string; render: (text: string) => JSX.Element; key: string })[], columns1: ({ dataIndex: string; title: string; render: (text: string) => JSX.Element; key: string } | { dataIndex: string; title: string; render: (text: string) => JSX.Element[]; key: string })[] }) {
    return <Space size="large" direction="vertical" style={{display: "flex"}}>
        <Table pagination={false} dataSource={props.data["items"]["children"]}
               columns={props.columns}></Table>
        <Table pagination={false} dataSource={props.data["items"]["files"]} columns={props.columns1}></Table>
    </Space>;
}