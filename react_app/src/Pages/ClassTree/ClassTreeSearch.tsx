import React, {useEffect, useRef, useState} from "react";
import {
    Alert,
    Badge,
    Card,
    Col,
    Collapse, List,
    message,
    Progress,
    Row,
    Space,
    Statistic,
    Typography,
    Upload,
    UploadProps
} from "antd";
import {useMutation, useQuery} from "@tanstack/react-query";
import axios from "axios";
import {ClockCircleTwoTone, InboxOutlined} from "@ant-design/icons";
import {ClassificationTree} from "./ClassificationTree";
import {ProjectsTable} from "../Tables/ProjectsTable";
import {api_url} from "../../Config";
import {GetToken, GetUser} from "../../Functions/DataStoring";
import {blue, red, green} from '@ant-design/colors';
import {WarningOutlined, UnorderedListOutlined, CheckCircleOutlined, ClockCircleOutlined} from '@ant-design/icons';

// @ts-ignore
export function ClassTreeSearch() {
    const [needToRefetch, setNeedToRefetch] = useState(true);
    const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
    const [uploadState, setUploadState] = useState({
        'percent': 0,
        'file_count': 0,
        'success_count': 0,
        'fail_count': 0,
        'in_progress_count': 0,
        'fail_files': Array<string>(),
        'success_files': Array<string>(),
        'in_progress_files': Array<string>(),
        'all_files': Array<string>(),
    });
    const {isLoading, isFetching, isPaused, error, data, refetch} = useQuery(
        {
            queryKey: ["getClassTree"],
            queryFn: async () => {
                return await axios.get(api_url + "/class_tree", {
                    params: {
                        user: GetUser(),
                        token: GetToken()
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
                return await axios.post(api_url + "/classification", variables, {
                    params: {
                        user: GetUser(),
                        token: GetToken()
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
        action: file => api_url + `/uploadfiles/${GetUser()}/${file.webkitRelativePath}?` + new URLSearchParams({
            token: GetToken(),
            user: GetUser(),
            create_missing_dir: '1',
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
                // message.error(`${info.file.name} file upload failed.`);
            }
            // count number of files that are successfully uploaded
            const successCount = info.fileList.reduce((acc, file) => {
                if (file.status === 'done') {
                    return acc + 1;
                }
                return acc;
            }, 0);
            // count number of files that are failed to upload
            const failCount = info.fileList.reduce((acc, file) => {
                if (file.status === 'error') {
                    return acc + 1;
                }
                return acc;
            }, 0);
            // count number of files that are in progress
            const inProgressCount = info.fileList.reduce((acc, file) => {
                if (file.status === 'uploading') {
                    return acc + 1;
                }
                return acc;
            }, 0);
            // progress of all files in percentage
            const totalPercent = ((successCount + failCount) / info.fileList.length) * 100;
            // get list of files that are successfully uploaded as an array of file names
            const successFiles = info.fileList.reduce((acc, file) => {
                if (file.status === 'done') {
                    return [...acc, file.name];
                }
                return acc;
            }, Array<string>());
            // get list of files that are failed to upload as an array of file names
            const failFiles = info.fileList.reduce((acc, file) => {
                if (file.status === 'error') {
                    return [...acc, file.name];
                }
                return acc;
            }, Array<string>());
            // get list of files that are in progress as an array of file names
            const inProgressFiles = info.fileList.reduce((acc, file) => {
                if (file.status === 'uploading') {
                    return [...acc, file.name];
                }
                return acc;
            }, Array<string>());
            const allFiles = info.fileList.reduce((acc, file) => {
                return [...acc, file.name];

            }, Array<string>());
            console.log(totalPercent.toString() + '%', uploadState.file_count, successCount, failCount, inProgressCount, successFiles, failFiles, inProgressFiles);
            setUploadState({
                'percent': totalPercent,
                'file_count': info.fileList.length,
                'success_count': successCount,
                'fail_count': failCount,
                'in_progress_count': inProgressCount,
                'fail_files': failFiles,
                'success_files': successFiles,
                'in_progress_files': inProgressFiles,
                'all_files': allFiles
            })
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
            setUploadState({
                'percent': 0,
                'file_count': e.dataTransfer.files.length,
                'success_count': 0,
                'fail_count': 0,
                'in_progress_count': 0,
                'all_files': Array<string>(),
                'fail_files': Array<string>(),
                'success_files': Array<string>(),
                'in_progress_files': Array<string>()
            })
        },
        showUploadList: false,
    };

    const ProgressInfo = () =>
        <Row justify="space-between" gutter={[16, 24]}>
            <Col>
                <Card>
                    <Statistic
                        title={
                            <Typography.Text>
                                Total files
                            </Typography.Text>
                        }
                        prefix={<UnorderedListOutlined/>}
                        value={uploadState.file_count}
                        valueStyle={{
                            color: uploadState.file_count === 0 ? red.primary : green.primary
                        }}
                    />
                </Card>
            </Col>
            <Col>
                <Card>
                    <Statistic
                        title={
                            <Typography.Text>
                                In progress files
                            </Typography.Text>
                        }
                        prefix={<ClockCircleOutlined/>}
                        value={uploadState.in_progress_count}
                        valueStyle={{
                            color: uploadState.in_progress_count === 0 ? green.primary : blue.primary
                        }}
                    />
                </Card>
            </Col>
            <Col>
                <Card>
                    <Statistic
                        title={
                            <Typography.Text>
                                Success files
                            </Typography.Text>
                        }
                        prefix={<CheckCircleOutlined/>}
                        value={uploadState.success_count}
                        valueStyle={{
                            color: uploadState.success_count === 0 ? red.primary : green.primary
                        }}
                    />
                </Card>
            </Col>
            <Col>
                <Card>
                    <Statistic
                        title={
                            <Typography.Text>
                                Failed files
                            </Typography.Text>
                        }
                        prefix={<WarningOutlined/>}
                        value={uploadState.fail_count}
                        valueStyle={{
                            color: uploadState.fail_count === 0 ? green.primary : red.primary
                        }}
                    />
                </Card>
            </Col>
        </Row>

    const alertType = () => {
        if (uploadState.in_progress_count === 0) {
            // if no files are failed, then upload is successful
            if (uploadState.fail_count === 0) {
                return 'success'
            } else {
                return 'error'
            }
        }
        return 'info'
    }

    return (
        <Row justify="space-evenly" gutter={[16, 24]}>
            <Col>
                <Space direction="vertical">
                    <Typography.Title>Class tree</Typography.Title>
                    <ClassificationTree
                        onClassCheck={(checkedValues: React.SetStateAction<React.Key[] | undefined | any>) => {
                            mutation.mutate(checkedValues)
                            setCheckedKeys(checkedValues)
                        }}/>
                </Space>
            </Col>
            <Col>
                <Space direction="vertical">
                    <Typography.Title>Projects</Typography.Title>
                    {checkedKeys?.length !== 0 &&
                        <Upload.Dragger {...draggerProps}>
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined/>
                            </p>
                            <p className="ant-upload-text">Click or drag file to this area to upload project with
                                following
                                classes<br/>{checkedKeys?.join(', ')}</p>
                        </Upload.Dragger>
                    }
                    {uploadState.file_count > 0 &&
                        <>
                            {alertType() === 'info' && <Progress type="line"
                                                                 percent={Math.round(uploadState.percent)}
                                                                 status={function () {
                                                                     // if no files are in progress, then upload is finished
                                                                     if (uploadState.in_progress_count === 0) {
                                                                         // if no files are failed, then upload is successful
                                                                         if (uploadState.fail_count === 0) {
                                                                             return 'success'
                                                                         } else {
                                                                             return 'exception'
                                                                         }
                                                                     }
                                                                     return 'active'
                                                                 }()
                                                                 }

                            />}
                            <Alert
                                message={`Upload ${alertType()}`}
                                description={<ProgressInfo/>}
                                type={alertType()}
                                showIcon
                            />
                            {
                                (uploadState.file_count > 0 || uploadState.success_count > 0 || uploadState.fail_count > 0) &&
                                <Collapse>
                                    {
                                        uploadState.file_count > 0 &&
                                        <Collapse.Panel
                                            header={
                                                <Typography.Text><UnorderedListOutlined/>Success files</Typography.Text>
                                            }
                                            key="1"
                                        >
                                            <List
                                                size="small"
                                                bordered
                                                dataSource={uploadState.all_files}
                                                renderItem={item => <List.Item>{item}</List.Item>}
                                            />
                                        </Collapse.Panel>
                                    }
                                    {uploadState.success_count > 0 &&
                                        <Collapse.Panel
                                            header={
                                                <Typography.Text><CheckCircleOutlined/>Success files</Typography.Text>
                                            }
                                            key="2">
                                            <List
                                                size="small"
                                                bordered
                                                dataSource={uploadState.success_files}
                                                renderItem={item => <List.Item>{item}</List.Item>}
                                            />
                                        </Collapse.Panel>
                                    }
                                    {uploadState.fail_count > 0 &&
                                        <Collapse.Panel
                                            header={
                                                <Typography.Text><WarningOutlined/>Failed files</Typography.Text>
                                            }
                                            key="3">
                                            <List
                                                size="small"
                                                bordered
                                                dataSource={uploadState.fail_files}
                                                renderItem={item => <List.Item>{item}</List.Item>}
                                            />
                                        </Collapse.Panel>
                                    }
                                </Collapse>
                            }
                        </>
                    }
                    <ProjectsTable data={searchData} isLoading={mutation.isLoading}/>
                </Space>
            </Col>
        </Row>
    )
}