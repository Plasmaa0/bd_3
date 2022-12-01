import React, {useEffect, useState} from 'react';
import {Link, Route, Routes, useLocation, useParams} from "react-router-dom";
import {message, Space, Tag, Typography, UploadProps} from "antd";
import {useQuery} from "@tanstack/react-query";
import get from "axios";
import {UniqueColorFromString} from "../Util/Utils";
import {DeleteButton} from "../Util/DeleteButton";
import {ProjectPageHeader} from "./ProjectPageHeader";
import {ProjectPageContent} from "./ProjectPageContent";
import {PageBreadcrumb} from "./PageBreadcrumb";

// @ts-ignore
export function ProjectPage({getToken, getUser}) {
    const {user, project_path} = useParams<string>();
    const [needToRefetch, setNeedToRefetch] = useState(false);

    const location = useLocation().pathname.split('/');
    location.shift();
    location.shift();
    var loc = ''
    for (const string in location) {
        loc += location[string] + '/'
    }
    while (loc.endsWith('/'))
        loc = loc.slice(0, -1)

    const {isLoading, isFetching, error, data, refetch} = useQuery(["projectPageData"], () =>
        get("http://127.0.0.1:8000/dir/" + user + '/' + loc + '?' + new URLSearchParams({
            token: getToken(),
            user: getUser()
        }))
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
        page: {user} {project_path}</Typography.Title><Typography.Text>{error.response.data}</Typography.Text></div>);
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
                    <DeleteButton type="rm"
                                  user={user}
                                  getToken={getToken}
                                  setNeedToRefetch={setNeedToRefetch}
                                  getUser={getUser}
                                  location={loc + '/' + text}/>
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
                })
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
                    <DeleteButton type="rmdir"
                                  user={user}
                                  getToken={getToken}
                                  setNeedToRefetch={setNeedToRefetch}
                                  getUser={getUser}
                                  location={loc + '/' + text}/>
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
        },
        {
            title: 'Classes',
            dataIndex: 'classes',
            key: 'classes',
            render: (text: string[]) => {
                return (
                    <Space>
                        {text.map((item) => {
                            return (
                                <Tag key={item} color={UniqueColorFromString(item)}>{item}</Tag>
                            );
                        })}
                    </Space>
                )
            }
        }
    ];
    // @ts-ignore
    const tags = data['tags']?.split(',')?.map((item) => {
        return (
            <Tag key={item} color={UniqueColorFromString(item)}>{item}</Tag>
        );
    });

    const props: UploadProps = {
        name: 'file',
        multiple: true,
        action: `http://127.0.0.1:8000/uploadfiles/${user}/${loc}?` + new URLSearchParams({
            token: getToken(),
            user: getUser()
        }),
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


    return (
        <div>
            <PageBreadcrumb setNeedToRefetch={setNeedToRefetch}/>
            <Space size="large" direction="vertical" style={{display: 'flex'}}>
                <ProjectPageHeader loc={loc} tags={tags} user={getUser} user1={user} token={getToken}
                                   needToRefetch={setNeedToRefetch} data={data} props={props}/>
                {/*@ts-ignore*/}
                <ProjectPageContent data={data} columns={childrenProjectsColumns} columns1={filesColumns}/>
                <Routes>
                    <Route path={`${loc}/:project_path/*`}
                           element={<ProjectPage getToken={getToken} getUser={getUser}/>}/>
                </Routes>
            </Space>
        </div>);
}