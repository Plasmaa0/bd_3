import {Button, Col, Collapse, Row, Space, Tag, Tooltip, Typography, Upload, UploadProps} from "antd";
import {EditTags} from "../Util/EditTags";
import {UploadOutlined} from "@ant-design/icons";
import {AddProjectForm} from "../UserPage/addProjectForm";
import React from "react";
import {UniqueColorFromString} from "../Util/Utils";
import {DownloadProject} from "./DownloadProject";

export function ProjectPageHeader(props: { loc: string, tags: any, user1: string | undefined, needToRefetch: (value: (((prevState: boolean) => boolean) | boolean)) => void, data: any, props: UploadProps }) {
    const ifTags = () => {
        if (props.tags?.length > 0) {
            if (props.tags[0].key.length > 0) {
                return props.tags
            }
        }
        return <p></p>
    }
    return (
        // <Space size="middle" style={{display: "flex", justifyContent: "space-between"}}>
        <Row justify="space-between" align="middle" gutter={[16, 24]}>
            <Col>
                <Typography.Title level={3}>{props.data['name']} {ifTags()}</Typography.Title>
            </Col>
            <Col>
                <Tooltip title="Классификация" placement="bottom">
                    <Space>
                        {/*@ts-ignore*/}
                        {props.data['classes']?.map((item) => {
                            return (
                                <Tag key={item} color={UniqueColorFromString(item)}>{item}</Tag>
                            );
                        })}
                    </Space>
                </Tooltip>
            </Col>
            <Col>
                <EditTags loc={props.loc}
                          user={props.user1}
                          setNeedToRefetch={props.needToRefetch}
                          data={props.data}/>
            </Col>
            <Col>
                <DownloadProject/>
            </Col>
            <Col>
                <Upload {...props.props}>
                    <Button icon={<UploadOutlined/>}>Upload File</Button>
                </Upload>
            </Col>
            <Col>
                <Collapse>
                    <Collapse.Panel header="Add subproject" key="1">
                        <AddProjectForm existingProjects={props.data}
                                        user={props.user1}
                                        setNeedToRefetch={props.needToRefetch}
                                        loc={props.loc}/>
                    </Collapse.Panel>
                </Collapse>
            </Col>
        </Row>
        // </Space>
    )
}