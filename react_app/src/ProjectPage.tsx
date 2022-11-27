import React, {useEffect, useState} from 'react';
import {Link, Route, useParams, useLocation, Routes} from "react-router-dom";
import {
    Table,
    Breadcrumb,
    Typography,
    Tag,
    Space,
    Button,
    Upload,
    message,
    UploadProps,
    Collapse,
    Modal, Tooltip, Select
} from "antd";
import {UploadOutlined, DeleteOutlined, EditOutlined} from '@ant-design/icons';
import {useQuery} from "@tanstack/react-query";
import get from "axios";
import {AddProjectForm} from "./addProjectForm";
import {UniqueColorFromString} from "./Utils";
import type {CustomTagProps} from 'rc-select/lib/BaseSelect';
import {tags_for_antd_select} from "./tags_complete";

// @ts-ignore
export function ProjectPage({getToken}) {
    const {user, project_path} = useParams<string>();
    const [needToRefetch, setNeedToRefetch] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false); // edit tags modal

    const location = useLocation().pathname.split('/');
    location.shift();
    location.shift();
    var loc = ''
    for (const string in location) {
        loc += location[string] + '/'
    }
    while (loc.endsWith('/'))
        loc = loc.slice(0, -1)

    const pathSnippets = useLocation().pathname.split('/').filter((i) => i)
    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        return (
            <Breadcrumb.Item key={url}>
                <Link to={url} onClick={() => {
                    setNeedToRefetch(true);
                }}>
                    {pathSnippets[index]}
                </Link>
            </Breadcrumb.Item>
        );
    });
    const breadcrumbItems = [
        <Breadcrumb.Item key="home">
            <Link to="/">Home</Link>
        </Breadcrumb.Item>,
    ].concat(extraBreadcrumbItems);

    const {isLoading, isFetching, error, data, refetch} = useQuery(["projectPageData"], () =>
        get("http://127.0.0.1:8000/dir/" + user + '/' + loc + '?' + new URLSearchParams({token: getToken()}))
            .then((res) => res.data)
    );
    useEffect(() => {
        refetch().then((res) => res.data);
        setNeedToRefetch(false);
    }, [needToRefetch]);

    if (isLoading) return (
        <div><Typography.Title level={2}>{loc}</Typography.Title><Typography.Text>Loading...</Typography.Text></div>);
    if (isFetching) return (<div><Typography.Title>Project
        page: {user} {project_path}</Typography.Title><Typography.Text>Fetching...</Typography.Text></div>);
    if (error) return (<div><Typography.Title>Project
        {/*// @ts-ignore*/}
        page: {user} {project_path}</Typography.Title><Typography.Text>ERROR {error.message}</Typography.Text></div>);
    const filesColumns = [
        {
            title: 'File name',
            dataIndex: 'name',
            key: 'name',
            // @ts-ignore
            render: (text: string) =>
                <Space size="middle" direction="horizontal" style={{display: "flex", justifyContent: "space-between"}}>
                    <Link to={'/file/' + user + '/' + loc + '/' + text}>
                        {text}
                    </Link>
                    <Button danger onClick={async event => {
                        await get("http://127.0.0.1:8000/rm/" + user + '/' + loc + '/' + text + '?' + new URLSearchParams({token: getToken()}))
                            .then((res) => res.status)
                        setNeedToRefetch(true)
                        message.success(`Removed ${text}`)
                    }}>
                        <DeleteOutlined/>
                    </Button>
                </Space>
        },
        {
            title: 'Extension',
            dataIndex: 'ext',
            key: 'ext',
            render: (text: string) => {
                return text.split(',').map((item) => {
                    return (
                        <Tag key={item} color={UniqueColorFromString(item)}>{item}</Tag>
                    );
                });
            }
        }
    ];
    const childrenProjectsColumns = [
        {
            title: 'Nested projects',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) =>
                <Space size="middle" direction="horizontal" style={{display: "flex", justifyContent: "space-between"}}>
                    <Link to={'/' + user + '/' + loc + '/' + text} onClick={() => {
                        setNeedToRefetch(true);
                    }}>
                        {text}
                    </Link>
                    <Button danger onClick={async event => {
                        const s = await get("http://127.0.0.1:8000/rmdir/" + user + '/' + loc + '/' + text + '?' + new URLSearchParams({token: getToken()}))
                            .then((res) => res.status)
                        if (s === 200) {
                            setNeedToRefetch(true)
                            message.success(`Removed ${text}`)
                        }
                    }}>
                        <DeleteOutlined/>
                    </Button>
                </Space>
        },
        {
            title: 'Tags',
            dataIndex: 'tags',
            key: 'tags',
            render: (text: string) => {
                return (
                    <Space size="middle" direction="horizontal"
                           style={{display: "flex", justifyContent: "space-between"}}>
                        <Space size="small">
                            {text.split(',').map((item) => {
                                return (
                                    <Tag key={item} color={UniqueColorFromString(item)}>{item}</Tag>
                                );
                            })}
                        </Space>
                    </Space>)
            }
        }
    ];
    // @ts-ignore
    const tags = data['tags'].split(',').map((item) => {
        return (
            <Tag key={item} color={UniqueColorFromString(item)}>{item}</Tag>
        );
    });

    const props: UploadProps = {
        name: 'file',
        multiple: true,
        action: `http://127.0.0.1:8000/uploadfiles/${user}/${loc}?` + new URLSearchParams({token: getToken()}),
        // headers: {
        //     authorization: 'authorization-text',
        // },
        method: "POST",
        onChange(info) {
            if (info.file.status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (info.file.status === 'done') {
                message.success(`${info.file.name} file uploaded successfully`);
                setNeedToRefetch(true)
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
                setNeedToRefetch(true)
            }
        }
    };

    var selectedTagsSet = new Set();
    for (const tag of data['tags'].split(',')) {
        selectedTagsSet.add(tag);
    }
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = async () => {
        // const new_tags = inputRef?.current?.input?.value
        const new_tags = Array.from(selectedTagsSet).join(',')
        // do post in api
        const path = `http://127.0.0.1:8000/edit_tags/${user}/${loc}?` +
            // @ts-ignore
            new URLSearchParams({token: getToken(), tags: new_tags})
        await get(path).then((res) => res.data)
        message.success("Tags updated!")
        setNeedToRefetch(true)
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        message.warning("Tags not updated!")
        setIsModalOpen(false);
    };

    const tagRender = (props: CustomTagProps) => {
        const {label, value, closable, onClose} = props;
        const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
            event.preventDefault();
            event.stopPropagation();
        };
        return (
            <Tag
                color={UniqueColorFromString(value)}
                onMouseDown={onPreventMouseDown}
                closable={closable}
                onClose={onClose}
                style={{marginRight: 3}}
            >
                {label}
            </Tag>
        );
    };

    return (
        <div>
            <Breadcrumb>{breadcrumbItems}</Breadcrumb>
            <Space size="large" direction="vertical" style={{display: 'flex'}}>
                <Space size="middle" direction="horizontal" style={{display: "flex", justifyContent: "space-between"}}>
                    <Space>
                        <Typography.Title level={2}>{loc} - {tags}</Typography.Title>
                        <Tooltip title="Edit tags" placement="right">
                            <Button type="primary" onClick={showModal}>
                                <EditOutlined/>
                            </Button>
                        </Tooltip>
                        <Modal title="Edit tags" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                            <Select
                                mode="tags"
                                showArrow
                                tagRender={tagRender}
                                defaultValue={data['tags']?.split(',')}
                                tokenSeparators={[',']}
                                style={{width: '100%'}}
                                options={tags_for_antd_select}
                                // @ts-ignore
                                onSelect={(value, option) => {
                                    console.log('select', value)
                                    selectedTagsSet.add(value);
                                }}
                                // @ts-ignore
                                onDeselect={(value, option) => {
                                    console.log('deselect', value)
                                    selectedTagsSet.delete(value)
                                }}
                            />
                        </Modal>
                    </Space>
                    <Space size="small" direction="horizontal">
                        <Upload {...props}>
                            <Button icon={<UploadOutlined/>}>Upload File</Button>
                        </Upload>
                        <Collapse>
                            <Collapse.Panel header="Add subproject" key="1">
                                <AddProjectForm existingProjects={data} user={user} setNeedToRefetch={setNeedToRefetch}
                                                loc={loc}
                                                getToken={getToken}/>
                            </Collapse.Panel>
                        </Collapse>
                    </Space>
                </Space>
                <Space size="large" direction="vertical" style={{display: 'flex'}}>
                    <Table pagination={false} dataSource={data['items']['children']}
                           columns={childrenProjectsColumns}></Table>
                    <Table pagination={false} dataSource={data['items']['files']} columns={filesColumns}></Table>
                </Space>
                <Routes>
                    <Route path={`${loc}/:project_path/*`} element={<ProjectPage getToken={getToken}/>}/>
                </Routes>
            </Space>
        </div>);
}