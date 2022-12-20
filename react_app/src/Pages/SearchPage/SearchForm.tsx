import React, {useEffect, useState} from "react";
import {Button, Divider, Form, Input, InputNumber, message, Select, Space, TreeSelect, Typography} from "antd";
import {useQuery} from "@tanstack/react-query";
import get from "axios";
import axios from "axios";
import {ClockCircleTwoTone} from "@ant-design/icons";
import {ProjectsTable} from "../Tables/ProjectsTable";
import {FilesTable} from "../Tables/FilesTable";
import {UsersTable} from "../Tables/UsersTable";

function getQueryFn(search_type: string, getUser: () => string, getToken: () => string, searchParameters: {}) {
    return () => {
        return get(`http://virtual.fn11.bmstu.ru:3006/search/${search_type}/${getUser()}?` + new URLSearchParams({
            token: getToken()
        }), {params: searchParameters})
    };
}

// @ts-ignore
export function SearchForm({getToken, getUser, getRole}) {

    const [searchParamsForm] = Form.useForm();
    const [selectedForm, setSelectedForm] = useState<string>('projects');

    const [needToRefetch, setNeedToRefetch] = useState(false);
    const [dataValid, setDataValid] = useState(false);
    const [searchParameters, setSearchParameters] = useState({});
    const [search_type, setSearch_type] = useState('projects');
    const {isLoading, error, data, isPaused, isFetching, refetch} = useQuery(
        {
            queryKey: ["searchFormMutation"],
            queryFn: async () => {
                return await axios.post(`http://virtual.fn11.bmstu.ru:3006/search/${search_type}/${getUser()}`, searchParameters, {
                    params: {
                        token: getToken(),
                    },
                })
            },
            onSuccess: async data1 => {
                message.success('Done!');
            },
            onError: async error1 => {
                message.error('error')
            },
            enabled: false
        }
    )

    useEffect(() => {
        if (needToRefetch) {
            refetch().then((res) => res.data);
            setDataValid(true)
        }
        setNeedToRefetch(false);
    }, [needToRefetch]);


    const handleProjectSearch = async (values: any) => {
        await setSearchParameters({
            owner: values['owner-name'],
            project: values['project-name'],
            tags: values['tags'],
            classes: JSON.stringify(values['class']),
            limit: values['limit']
        })
        setNeedToRefetch(true)
    }
    const role = getRole();
    const username = getUser();
    const {isLoading: isClassTreeLoading, error: ClassTreeError, data: classTreeData} = useQuery(
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
    if (isClassTreeLoading) return (<ClockCircleTwoTone spin twoToneColor={"lime"} style={{fontSize: '25px'}}/>);
    if (ClassTreeError) { // @ts-ignore
        return (<Typography.Text>{error.response.data}</Typography.Text>);
    }
    const ProjectSearchForm = () =>
        <Space>
            <Form
                key="1"
                name="basic"
                labelCol={{span: 8}}
                wrapperCol={{span: 16}}
                validateTrigger="onChange"
                autoComplete="off"
                onFinish={handleProjectSearch}>
                <Form.Item label="Owner name"
                           name="owner-name"
                           initialValue={role !== 'admin' ? username : ''}
                           rules={[{required: true, message: "Required"},
                               {
                                   validator: (_, value) => {
                                       if (role !== 'admin') {
                                           if (value !== username) {
                                               return Promise.reject("Search other users only allowed for admins");
                                           }
                                       }
                                       return Promise.resolve();
                                   }
                               }]}>
                    <Input/>
                </Form.Item>
                <Form.Item label="Project name"
                           name="project-name"
                           rules={[{required: true, message: "Required"}]}>
                    <Input/>
                </Form.Item>
                {/*todo make this like in tag edit in ProjectPage.tsx maybe??*/}
                <Form.Item label="Tags"
                           name="tags"
                           rules={[{required: true, message: "Required"}]}>
                    <Input/>
                </Form.Item>
                <Form.Item
                    label="Class"
                    name="class"
                    rules={[{required: true, message: "Required"}]}>
                    <TreeSelect
                        showSearch
                        placeholder="Please select"
                        allowClear
                        multiple
                        treeCheckable={true}
                        showCheckedStrategy={"SHOW_PARENT"}
                        treeData={
                            // @ts-ignore
                            classTreeData.data
                        }
                    />
                </Form.Item>
                <Form.Item label="Limit"
                           name="limit"
                           initialValue={10}
                           rules={[{required: true, message: "Required"}]}>
                    <InputNumber/>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Search
                    </Button>
                </Form.Item>
            </Form></Space>

    const handleUserSearch = async (values: any) => {
        setSearchParameters({
            user: values['user-name'],
            role: values['role'],
            limit: values['limit']
        })
        setNeedToRefetch(true)
    }
    searchParamsForm.setFieldValue('role', 'default')
    const UserSearchForm = () =>
        <Space><Form
            form={searchParamsForm}
            key="2"
            name="basic"
            labelCol={{span: 8}}
            wrapperCol={{span: 16}}
            validateTrigger="onChange"
            autoComplete="off"
            onFinish={handleUserSearch}>
            <Form.Item label="User name"
                       name="user-name"
                       rules={[{required: true, message: "Required"}]}>
                <Input/>
            </Form.Item>
            <Form.Item label="Role"
                       name="role">
                <Select
                    showArrow
                    defaultValue={'default'}
                    style={{width: '100%'}}
                    onChange={value => searchParamsForm.setFieldValue('role', value)}
                    options={[{value: 'default'}, {value: 'admin'}]}
                />
            </Form.Item>
            <Form.Item label="Limit"
                       name="limit"
                       initialValue={10}
                       rules={[{required: true, message: "Required"}]}>
                <InputNumber/>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Search
                </Button>
            </Form.Item>
        </Form></Space>
    const handleFileSearch = async (values: any) => {
        setSearchParameters({
            owner: values['owner-name'],
            parent: values['parent'],
            filename: values['file-name'],
            path: values['path'],
            limit: values['limit']
        })
        setNeedToRefetch(true)
    }
    const FileSearchForm = () =>
        <Space>
            <Form
                key="3"
                name="basic"
                labelCol={{span: 8}}
                wrapperCol={{span: 16}}
                validateTrigger="onChange"
                autoComplete="off"
                onFinish={handleFileSearch}>
                <Form.Item label="Owner name"
                           name="owner-name"
                           initialValue={role !== 'admin' ? username : ''}
                           rules={[{required: true, message: "Required"},
                               {
                                   validator: (_, value) => {
                                       if (role !== 'admin') {
                                           if (value !== username) {
                                               return Promise.reject("Search other users only allowed for admins");
                                           }
                                       }
                                       return Promise.resolve();
                                   }
                               }]}>
                    <Input/>
                </Form.Item>
                <Form.Item label="Parent project"
                           name="parent"
                           rules={[{required: true, message: "Required"}]}>
                    <Input/>
                </Form.Item>
                <Form.Item label="File name"
                           name="file-name"
                           rules={[{required: true, message: "Required"}]}>
                    <Input/>
                </Form.Item>
                <Form.Item label="Path"
                           name="path"
                           rules={[{required: true, message: "Required"}]}>
                    <Input/>
                </Form.Item>
                <Form.Item label="Limit"
                           name="limit"
                           initialValue={10}
                           rules={[{required: true, message: "Required"}]}>
                    <InputNumber/>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Search
                    </Button>
                </Form.Item>
            </Form>
        </Space>
    const SearchResult = () => {
        if (isPaused) return (<Typography.Text>Paused</Typography.Text>);
        if (isLoading) return (<ClockCircleTwoTone spin twoToneColor={"lime"} style={{fontSize: '50px'}}/>);
        if (isFetching) return (<ClockCircleTwoTone spin twoToneColor={"lime"} style={{fontSize: '50px'}}/>);
        if (error) { // @ts-ignore
            return (<Typography.Text>{error.response.data}</Typography.Text>);
        }
        if (!dataValid)
            return <Typography.Text>Press search to update.</Typography.Text>
        // @ts-ignore
        if (classTreeData.status !== 200)
            return <Typography.Text>SERVER NOT OK</Typography.Text>
        switch (search_type) {
            case 'projects':
                // @ts-ignore
                return <ProjectsTable data={data.data}/>
            case 'files':
                // @ts-ignore
                return <FilesTable data={data}/>
            case 'users':
                // @ts-ignore
                return <UsersTable data={data} getToken={getToken} getUser={getUser}/>
            default:
                return <Typography.Text>Something went wrong</Typography.Text>
        }
    }
    const forms = {
        'projects': ProjectSearchForm,
        'users': UserSearchForm,
        'files': FileSearchForm
    }
    let options = [
        {
            value: 'projects',
            label: 'Projects',
        },
        {
            value: 'files',
            label: 'Files',
        }];
    if (role === 'admin') {
        options.push(
            {
                value: 'users',
                label: 'Users',
            })
    }
    return (
        <Space direction="horizontal" align="start">
            <Space direction="vertical">
                <Typography.Title>Search</Typography.Title>
                <Space direction="horizontal" size="large">
                    <Typography.Text>Search for:</Typography.Text>
                    <Select
                        defaultValue={"projects"}
                        style={{width: 150}}
                        options={options}
                        onSelect={(value: string) => {
                            setSelectedForm(value)
                            setSearch_type(value)
                            setDataValid(false)
                        }}
                    />
                </Space>
                {/*@ts-ignore*/}
                {forms[selectedForm]()}
            </Space>
            <Divider type="vertical"></Divider>
            <Space direction="vertical">
                <Typography.Title>Search result</Typography.Title>
                <SearchResult/>
            </Space>
        </Space>
    );
}
