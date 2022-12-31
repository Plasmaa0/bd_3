import {Table} from "antd";
import {Link} from "react-router-dom";
import React from "react";

export function FilesTable(props: { data: { data: readonly any[] | undefined; } }) {
    return <Table dataSource={props.data.data} pagination={{hideOnSinglePage: true, defaultPageSize: 10}}>
        <Table.Column
            title="File"
            dataIndex="name"
            key="name"
            render={(value, record) => {
                // @ts-ignore
                return <Link to={`/file/${record['owner']}/${record['path']}/${value}`}>{value}</Link>
            }
            }/>
        <Table.Column
            title="Owner"
            dataIndex="owner"
            key="owner"
            responsive={['xxl', 'xl', 'lg', 'md', 'sm']}
            render={(value) => {
                return <Link to={`/${value}`}>{value}</Link>
            }}
        />
        <Table.Column
            title="Parent project"
            dataIndex="parent_project"
            key="parent_project"
            responsive={['xxl', 'xl', 'lg', 'md']}
            render={(value, record) => {
                // @ts-ignore
                return <Link to={`/${record['owner']}/${record['path']}`}>{value}</Link>
            }
            }
        />
        <Table.Column
            title="Path"
            key="path"
            responsive={['xxl', 'xl', 'lg']}
            dataIndex="path"
        />
    </Table>
}