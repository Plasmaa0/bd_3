import React, {useEffect, useState} from "react";
import {Button, Divider, Form, Input, Select, Space, Typography} from "antd";
import {useQuery} from "@tanstack/react-query";
import get from "axios";

function getQueryFn(search_type: string, getUser: () => string, getToken: () => string, searchParameters: {}) {
    return () => {
        return get(`http://127.0.0.1:8000/search/${search_type}/${getUser()}?` + new URLSearchParams({
            token: getToken()
        }), {params: searchParameters})
    };
}

// @ts-ignore
export function SearchForm({getToken, getUser}) {

    const [needToRefetch, setNeedToRefetch] = useState(false);
    const [searchParameters, setSearchParameters] = useState({});
    const [search_type, setSearch_type] = useState('projects');
    const {isLoading, isFetching, isPaused, error, data, refetch} = useQuery({
        queryKey: ["projectPageData"],
        queryFn: getQueryFn(search_type, getUser, getToken, searchParameters),
        enabled: false
    });

    useEffect(() => {
        if (needToRefetch) {
            refetch().then((res) => res.data);
        }
        setNeedToRefetch(false);
    }, [needToRefetch]);

    const handleProjectSearch = async (values: any) => {
        setSearchParameters({
            owner: values['owner-name'],
            project: values['project-name'],
            tags: values['tags']
        })
        setNeedToRefetch(true)
    }
    const ProjectSearchForm = () =>
        <Form
            key="1"
            name="basic"
            labelCol={{span: 8}}
            wrapperCol={{span: 16}}
            validateTrigger="onChange"
            autoComplete="off"
            onFinish={handleProjectSearch}>
            {/*fixme only show 'owner name' if user is admin*/}
            <Form.Item label="Owner name"
                       name="owner-name">
                <Input/>
            </Form.Item>
            <Form.Item label="Project name"
                       name="project-name">
                <Input/>
            </Form.Item>
            {/*todo make this like in tag edit in ProjectPage.tsx maybe??*/}
            <Form.Item label="Tags"
                       name="tags">
                <Input/>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Search
                </Button>
            </Form.Item>
        </Form>

    // fixme only show user search if current user is admin
    const handleUserSearch = async (values: any) => {
        setSearchParameters({
            user: values['user-name']
        })
        setNeedToRefetch(true)
    }
    const UserSearchForm = () =>
        <Form
            key="2"
            name="basic"
            labelCol={{span: 8}}
            wrapperCol={{span: 16}}
            validateTrigger="onChange"
            autoComplete="off"
            onFinish={handleUserSearch}>
            <Form.Item label="User name"
                       name="user-name">
                <Input/>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Search
                </Button>
            </Form.Item>
        </Form>
    const handleFileSearch = async (values: any) => {
        setSearchParameters({
            owner: values['owner-name'],
            filename: values['file-name']
        })
        setNeedToRefetch(true)
    }
    const FileSearchForm = () =>
        <Form
            key="3"
            name="basic"
            labelCol={{span: 8}}
            wrapperCol={{span: 16}}
            validateTrigger="onChange"
            autoComplete="off"
            onFinish={handleFileSearch}>
            {/*fixme only show 'owner name' if user is admin*/}
            <Form.Item label="Owner name"
                       name="owner-name">
                <Input/>
            </Form.Item>
            <Form.Item label="File name"
                       name="file-name">
                <Input/>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Search
                </Button>
            </Form.Item>
        </Form>
    const [selectedForm, setSelectedForm] = useState<string>('projects');
    const SearchResult = () => {
        if (isPaused) return (<Typography.Text>Paused</Typography.Text>);
        if (isLoading) return (<Typography.Text>Loading...</Typography.Text>);
        if (isFetching) return (<Typography.Text>Fetching...</Typography.Text>);
        if (error) { // @ts-ignore
            return (<Typography.Text> ERROR {error.message}</Typography.Text>);
        }
        // @ts-ignore
        return <Typography.Text>Result of search by {selectedForm}: <Space>{data.data}</Space></Typography.Text>
    }
    const forms = {
        'projects': ProjectSearchForm,
        'users': UserSearchForm,
        'files': FileSearchForm
    }
    return (
        <Space direction="horizontal">
            <Space direction="vertical">
                <Typography.Title>Search</Typography.Title>
                <Space direction="horizontal" size="large">
                    <Typography.Text>Search for:</Typography.Text>
                    <Select
                        defaultValue={"projects"}
                        style={{width: 150}}
                        options={[
                            {
                                value: 'projects',
                                label: 'Projects',
                            },
                            {
                                value: 'users',
                                label: 'Users',
                            },
                            {
                                value: 'files',
                                label: 'Files',
                            }]}
                        onSelect={(value: string) => {
                            setSelectedForm(value)
                            setSearch_type(value)
                        }}
                    />
                </Space>
                {/*FIXME SET THAT EVERY INPUT IS REQUIRED AND INTRODUCE 'LIMIT' PARAMETER*/}
                {/*@ts-ignore*/}
                {forms[selectedForm]()}
            </Space>
            <Divider type="vertical"></Divider>
            <Space direction="vertical">
                <Typography.Title>Content</Typography.Title>
                <Typography.Text>Search parameters json: {JSON.stringify(searchParameters)}</Typography.Text>
                <SearchResult/>
            </Space>
        </Space>
    );
}
