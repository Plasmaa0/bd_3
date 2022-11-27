import React, {useEffect, useState} from "react";
import {
    Button,
    Divider,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Select,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography
} from "antd";
import {useQuery} from "@tanstack/react-query";
import get from "axios";
import {Link} from "react-router-dom";
import {ClockCircleTwoTone, DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {UniqueColorFromString} from "./Utils";

function getQueryFn(search_type: string, getUser: () => string, getToken: () => string, searchParameters: {}) {
    return () => {
        return get(`http://127.0.0.1:8000/search/${search_type}/${getUser()}?` + new URLSearchParams({
            token: getToken()
        }), {params: searchParameters})
    };
}

// @ts-ignore
export function SearchForm({getToken, getUser, getRole}) {

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
            tags: values['tags'],
            limit: values['limit']
        })
        setNeedToRefetch(true)
    }
    const role = getRole();
    const username = getUser();
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
        console.log(values)
        setSearchParameters({
            user: values['user-name'],
            role: values['role'],
            limit: values['limit']
        })
        setNeedToRefetch(true)
    }
    const [searchParamsForm] = Form.useForm();
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
            {/*todo change role to <Select/>*/}
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
    const [selectedForm, setSelectedForm] = useState<string>('projects');

    const [editRoleForm] = Form.useForm();
    const [editRoleUser, setEditRoleUser] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false); // edit tags modal
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = async () => {
        const newRole = editRoleForm.getFieldValue('role');
        const path = `http://127.0.0.1:8000/edit_role/${editRoleUser}?` +
            // @ts-ignore
            new URLSearchParams({
                new_role: newRole,
                token: getToken(),
                user: getUser()
            })
        await get(path).then((res) => res.data)
        message.success("Role updated!")
        setNeedToRefetch(true)
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        message.warning("Role not updated!")
        setIsModalOpen(false);
    };

    const SearchResult = () => {
        if (isPaused) return (<Typography.Text>Paused</Typography.Text>);
        if (isLoading) return (<ClockCircleTwoTone spin twoToneColor={"lime"} style={{fontSize: '50px'}}/>);
        if (isFetching) return (<ClockCircleTwoTone spin twoToneColor={"lime"} style={{fontSize: '50px'}}/>);
        if (error) { // @ts-ignore
            return (<Typography.Text>{error.response.data}</Typography.Text>);
        }
        // @ts-ignore
        if (data.status !== 200)
            return <Typography.Text>SERVER NOT OK</Typography.Text>
        switch (search_type) {
            case 'projects':
                // @ts-ignore
                return <Table dataSource={data.data} pagination={false}>
                    <Table.Column
                        title="Name"
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
                        render={(value) => {
                            return <Link to={`/${value}`}>{value}</Link>
                        }}
                    />
                    <Table.Column
                        title="Tags"
                        dataIndex="tags"
                        key="tags"
                        render={(value: string) => {
                            return (
                                <Space size="middle" direction="horizontal"
                                       style={{display: "flex", justifyContent: "space-between"}}>
                                    <Space size="small">
                                        {value.split(',').map((value) => {
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
                        dataIndex="path_to"
                    />
                </Table>
            case 'files':
                // @ts-ignore
                return <Table dataSource={data.data} pagination={false}>
                    <Table.Column
                        title="Name"
                        dataIndex="name"
                        key="name"
                        render={(value, record) => {
                            // @ts-ignore
                            return <Link to={`/file/${record['owner']}/${record['path']}/${value}`}>{value}</Link>
                        }
                        }/>
                    <Table.Column
                        title="Owner"
                        dataIndex="owner"
                        key="owner"
                        render={(value) => {
                            return <Link to={`/${value}`}>{value}</Link>
                        }}
                    />
                    <Table.Column
                        title="Parent project"
                        dataIndex="parent_project"
                        key="parent_project"
                        render={(value, record) => {
                            // @ts-ignore
                            return <Link to={`/${record['owner']}/${record['path']}`}>{value}</Link>
                        }
                        }
                    />
                    <Table.Column
                        title="Path"
                        key="path"
                        dataIndex="path"
                    />
                </Table>
            case 'users':
                // @ts-ignore
                return <Table dataSource={data.data} pagination={false}>
                    <Table.Column
                        title="Name"
                        key="name"
                        dataIndex="name"
                        render={(value) => {
                            return <Link to={`/${value}`}>{value}</Link>
                        }}
                    />
                    <Table.Column
                        title="Role"
                        key="role"
                        dataIndex="role"
                        render={(value, record) => {
                            return (
                                <Space>
                                    <Modal title="Edit user role" open={isModalOpen} onOk={handleOk}
                                           onCancel={handleCancel}>
                                        <Form
                                            form={editRoleForm}
                                            key="2"
                                            name="basic"
                                            labelCol={{span: 8}}
                                            wrapperCol={{span: 16}}
                                            validateTrigger="onChange"
                                            autoComplete="off"
                                            initialValues={{role: value}}
                                            // onFinish={handleUserSearch}
                                        >
                                            <Form.Item label="Role"
                                                       name="role">
                                                <Select
                                                    showArrow
                                                    defaultValue={'default'}
                                                    style={{width: '100%'}}
                                                    onChange={value => editRoleForm.setFieldValue('role', value)}
                                                    options={[{value: 'default'}, {value: 'admin'}]}
                                                />
                                            </Form.Item>
                                        </Form>
                                    </Modal>
                                    <Typography.Text>{value}</Typography.Text>
                                    <Tooltip title="Edit user role" placement="right">
                                        <Button type="primary" onClick={event => {
                                            showModal()
                                            // @ts-ignore
                                            setEditRoleUser(record['name'])
                                        }}>
                                            <EditOutlined/>
                                        </Button>
                                    </Tooltip>
                                </Space>)
                        }
                        }
                    />
                </Table>
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
