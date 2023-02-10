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
import {api_url} from "../../Config";
import {GetToken, GetUser} from "../../Functions/DataStoring";

// @ts-ignore
export function ProjectPage() {
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
        get(api_url + "/dir/" + user + '/' + loc + '?' + new URLSearchParams({
            token: GetToken(),
            user: GetUser()
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
                                  setNeedToRefetch={setNeedToRefetch}
                                  location={loc + '/' + text}/>
                </Space>
        },
        {
            title: 'Extension',
            dataIndex: 'ext',
            key: 'ext',
            render: (text: string) => {
                return text?.split(',').map((item) => {
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
                                  setNeedToRefetch={setNeedToRefetch}
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
                            {text?.split(',').map((item) => {
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
        action: api_url + `/uploadfiles/${user}/${loc}?` + new URLSearchParams({
            token: GetToken(),
            user: GetUser()
        }),
        method: "POST",
        onChange(info) {
            let deferred_refetch = true;
            for (let i = 0; i < info.fileList.length; i++) {
                const f = info.fileList[i];
                if (f.status === 'uploading') {
                    deferred_refetch = false;
                }
            }
            if (info.file.status !== 'uploading') {
                // console.log(info.file, info.fileList);
            }
            if (info.file.status === 'done') {
                // message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
            if (deferred_refetch) {
                message.success('Файлы загружены.\nСтраница обновится через 5 секунд.',
                    5,
                    () => {
                        setNeedToRefetch(true)
                    }
                )
            }
        },

    };

console.log(data)
    return (
        <div>
            <PageBreadcrumb setNeedToRefetch={setNeedToRefetch}/>
            <Space size="large" direction="vertical" style={{display: 'flex'}}>
                <ProjectPageHeader loc={loc} tags={tags} user1={user}
                                   needToRefetch={setNeedToRefetch} data={data} props={props}/>
                {/*@ts-ignore*/}
                <ProjectPageContent data={data} columns={childrenProjectsColumns} columns1={filesColumns}/>
                <Routes>
                    <Route path={`${loc}/:project_path/*`}
                           element={<ProjectPage/>}/>
                </Routes>
            </Space>
        </div>);
}