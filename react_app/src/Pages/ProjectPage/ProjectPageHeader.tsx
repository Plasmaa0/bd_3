import {Button, Collapse, Space, Tag, Typography, Upload, UploadProps} from "antd";
import {EditTags} from "../Util/EditTags";
import {UploadOutlined} from "@ant-design/icons";
import {AddProjectForm} from "../UserPage/addProjectForm";
import React from "react";
import {UniqueColorFromString} from "../Util/Utils";

export function ProjectPageHeader(props: { loc: string, tags: any, user: any, user1: string | undefined, token: any, needToRefetch: (value: (((prevState: boolean) => boolean) | boolean)) => void, data: any, props: UploadProps }) {
    return <Space size="middle" direction="horizontal" style={{display: "flex", justifyContent: "space-between"}}>
        <Space direction="vertical">
            <Space direction="horizontal">
                <Typography.Title level={2}>{props.loc} - {props.tags}</Typography.Title>
                <EditTags getUser={props.user}
                          loc={props.loc}
                          user={props.user1}
                          getToken={props.token}
                          setNeedToRefetch={props.needToRefetch}
                          data={props.data}/>
            </Space>

            <Space>
                {/*@ts-ignore*/}
                {props.data['classes']?.map((item) => {
                    return (
                        <Tag key={item} color={UniqueColorFromString(item)}>{item}</Tag>
                    );
                })}
            </Space>
        </Space>
        <Space size="small" direction="horizontal">
            <Upload {...props.props}>
                <Button icon={<UploadOutlined/>}>Upload File</Button>
            </Upload>
            <Collapse>
                <Collapse.Panel header="Add subproject" key="1">
                    <AddProjectForm existingProjects={props.data}
                                    user={props.user1}
                                    getToken={props.token}
                                    setNeedToRefetch={props.needToRefetch}
                                    getUser={props.user}
                                    loc={props.loc}/>
                </Collapse.Panel>
            </Collapse>
        </Space>
    </Space>;
}