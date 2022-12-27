import {Space, Table, Tag} from "antd";
import {Link} from "react-router-dom";
import {UniqueColorFromString} from "../Util/Utils";
import React from "react";

//@ts-ignore
export function ProjectsTable({data}) {
    return <Table dataSource={data} pagination={{hideOnSinglePage: true}}>
        <Table.Column
            title="Name"
            dataIndex="name"
            key="name"
            render={(value, record) => {
                // @ts-ignore
                return <Link to={`/${record['owner']}/${record['path_to']}`}>{value}</Link>
            }
            }/>
        <Table.Column
            title="Owner"
            dataIndex="owner"
            key="owner"
            render={(value) => {
                return <Link to={`/${value}`}>{value}</Link>
            }}
        />
        <Table.Column
            title="Tags"
            dataIndex="tags"
            key="tags"
            render={(value: string) => {
                return (
                    <Space size="middle" direction="horizontal"
                           style={{display: "flex", justifyContent: "space-between"}}>
                        <Space size="small">
                            {value?.split(',')?.map((value) => {
                                return (
                                    <Tag key={value} color={UniqueColorFromString(value)}>{value}</Tag>
                                );
                            })}
                        </Space>
                    </Space>)
            }
            }
        />
        <Table.Column
            title="Classes"
            dataIndex="class"
            key="class"
            render={(value: string) => {
                return (
                    <Space size="middle" direction="horizontal"
                           style={{display: "flex", justifyContent: "space-between"}}>
                        <Space size="small">
                            {value?.split(',')?.map((value) => {
                                return (
                                    <Tag key={value} color={UniqueColorFromString(value)}>{value}</Tag>
                                );
                            })}
                        </Space>
                    </Space>)
            }
            }
        />
        <Table.Column
            title="Path"
            key="path_to"
            dataIndex="path_to"
        />
    </Table>
        ;
}