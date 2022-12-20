import React, {useEffect, useState} from "react";
import {Divider, message, Space, Typography, Upload, UploadProps} from "antd";
import {useMutation, useQuery} from "@tanstack/react-query";
import axios from "axios";
import {ClockCircleTwoTone, InboxOutlined} from "@ant-design/icons";
import {ClassificationTree} from "./ClassificationTree";
import {ProjectsTable} from "../Tables/ProjectsTable";

// @ts-ignore
export function ClassTreeSearch({getUser, getToken}) {
    const [needToRefetch, setNeedToRefetch] = useState(true);
    const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
    const {isLoading, isFetching, isPaused, error, data, refetch} = useQuery(
        {
            queryKey: ["getClassTree"],
            queryFn: async () => {
                return await axios.get("http://virtual.fn11.bmstu.ru:3006/class_tree", {
                    params: {
                        user: getUser(),
                        token: getToken()
                    }
                })
            }
        }
    )

    useEffect(() => {
        if (needToRefetch) {
            refetch().then((res) => res.data);
        }
        setNeedToRefetch(false);
    }, [needToRefetch]);

    const [searchData, setSearchData] = useState([]);
    const mutation = useMutation(
        {
            mutationKey: ["filterMutation"],
            mutationFn: async variables => {
                return await axios.post("http://virtual.fn11.bmstu.ru:3006/classification", variables, {
                    params: {
                        user: getUser(),
                        token: getToken()
                    }
                })
            },
            onSuccess: async data1 => {
                // @ts-ignore
                setSearchData(data1.data)
            },
            onError: async error1 => {
                message.error('Error updating class filter')
            }
        }
    )

    if (isPaused) return (<Typography.Text>Paused</Typography.Text>);
    if (isLoading) return (<ClockCircleTwoTone spin twoToneColor={"lime"} style={{fontSize: '50px'}}/>);
    if (isFetching) return (<ClockCircleTwoTone spin twoToneColor={"lime"} style={{fontSize: '50px'}}/>);
    if (error) { // @ts-ignore
        return (<Typography.Text>{error.text}</Typography.Text>);
    }
    const draggerProps: UploadProps = {
        name: 'file',
        multiple: true,
        directory: true,
        action: file => `http://virtual.fn11.bmstu.ru:3006/uploadfiles/${getUser()}/${file.webkitRelativePath}?` + new URLSearchParams({
            token: getToken(),
            user: getUser(),
            create_missing_dir: '1',
            // @ts-ignore
            class_names: checkedKeys.join('/')
        }),
        method: "POST",
        // beforeUpload: file => {
        //     console.log(file.name, file.webkitRelativePath)
        //     return false;
        // },
        onChange(info) {
            const {status} = info.file;
            if (status !== 'uploading') {
                // console.log(info.file, info.fileList);
            }
            if (status === 'done') {
                // message.success(`${info.file.name} file uploaded successfully.`);
            } else if (status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        }
    };

    const UploadZone = () => {
        if (checkedKeys?.length !== 0)
            return (
                <Upload.Dragger {...draggerProps}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined/>
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload project with following
                        classes<br/>{checkedKeys?.join(', ')}</p>
                </Upload.Dragger>
            )
        else
            return (<div></div>)
    }

    return (
        <Space align="start">
            <Space direction="vertical">
                <Typography.Title>Class tree</Typography.Title>
                <ClassificationTree getToken={getToken} getUser={getUser}
                                    onClassCheck={(checkedValues: React.SetStateAction<React.Key[] | undefined | any>) => {
                                        mutation.mutate(checkedValues)
                                        setCheckedKeys(checkedValues)
                                    }}/>
            </Space>
            <Divider type="vertical"/>
            <Space direction="vertical">
                <Typography.Title>Projects</Typography.Title>
                <UploadZone/>
                <ProjectsTable data={searchData}/>
            </Space>
        </Space>
    )
}