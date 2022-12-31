import {Col, Row, Space, Table, Tag} from "antd";
import {Link} from "react-router-dom";
import {UniqueColorFromString} from "../Util/Utils";
import React from "react";

//@ts-ignore
export function ProjectsTable({data, isLoading}) {
    return (
        <Table dataSource={data} pagination={{hideOnSinglePage: true}} loading={isLoading}>
            <Table.Column
                title="Project"
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
                responsive={['xxl', 'xl', 'lg', 'md', 'sm']}
                render={(value) => {
                    return <Link to={`/${value}`}>{value}</Link>
                }}
            />
            <Table.Column
                title="Tags"
                dataIndex="tags"
                key="tags"
                responsive={['xxl', 'xl', 'lg', 'md']}
                render={(value: string) => {
                    return (
                        <Row justify="space-evenly" gutter={[8, 8]}>
                            {value?.split(',')?.map((value) => {
                                return (
                                    <Col>
                                        <Tag key={value} color={UniqueColorFromString(value)}>{value}</Tag>
                                    </Col>
                                );
                            })}
                        </Row>)
                }
                }
            />
            <Table.Column
                title="Classes"
                dataIndex="class"
                key="class"
                responsive={['xxl', 'xl', 'lg']}
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
                responsive={['xxl', 'xl']}
                dataIndex="path_to"
            />
        </Table>
    );
}