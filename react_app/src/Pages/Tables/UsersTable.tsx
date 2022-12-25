import {Button, Form, message, Modal, Select, Space, Table, Tooltip, Typography} from "antd";
import React, {useState} from "react";
import get from "axios";
import {Link} from "react-router-dom";
import {EditOutlined} from "@ant-design/icons";
import {api_url} from "../ClassTree/Config";
import {GetToken, GetUser} from "../../Functions/DataStoring";


// @ts-ignore
export function UsersTable({data}) {
    const [editRoleForm] = Form.useForm();
    const [editRoleUser, setEditRoleUser] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false); // edit tags modal
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = async () => {
        const newRole = editRoleForm.getFieldValue('role');
        const path = api_url + `/edit_role/${editRoleUser}?` +
            // @ts-ignore
            new URLSearchParams({
                new_role: newRole,
                token: GetToken(),
                user: GetUser()
            })
        await get(path).then((res) => res.data)
        message.success("Role updated!")
        // @ts-ignore
        mutation.mutate(searchParameters)
        // setNeedToRefetch(true)
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        message.warning("Role not updated!")
        setIsModalOpen(false);
    };

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
}