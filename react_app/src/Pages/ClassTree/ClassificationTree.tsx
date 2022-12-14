import React, {Key, useEffect, useState} from "react";
import {Button, Form, Input, message, Modal, Popconfirm, Space, Tree, TreeDataNode, Typography} from "antd";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {ClockCircleTwoTone, EditTwoTone} from "@ant-design/icons";
import {api_url} from "../../Config";
import {GetToken, GetUser} from "../../Functions/DataStoring";

//@ts-ignore
export function ClassificationTree({onClassCheck}) {

    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>();
    const [checkedKeys, setCheckedKeys] = useState<React.Key[]>();
    const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editKey, setEditKey] = useState('');
    const [needToRefetch, setNeedToRefetch] = useState(false);
    const {isLoading, isFetching, error, data, refetch} = useQuery(
        {
            queryKey: ["getClassTreeClassificationTree"],
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
        refetch().then((res) => res.data);
        setNeedToRefetch(false);
    }, [needToRefetch]);

    if (isLoading) return (<ClockCircleTwoTone spin twoToneColor={"lime"} style={{fontSize: '25px'}}/>);
    if (isFetching) return (<ClockCircleTwoTone spin twoToneColor={"lime"} style={{fontSize: '25px'}}/>);
    if (error) { // @ts-ignore
        return (<Typography.Text>{error.response.data}</Typography.Text>);
    }
    const onExpand = (expandedKeysValue: React.Key[]) => {
        setExpandedKeys(expandedKeysValue);
        setAutoExpandParent(false);
    };

    const onCheck = (checkedKeysValue: any) => {
        setCheckedKeys(checkedKeysValue);
        onClassCheck(checkedKeysValue)
    };

    const onSelect = (selectedKeys: Key[], info: {
                          event: "select";
                          selected: boolean;
                          node: React.Key;
                          selectedNodes: any;
                          nativeEvent: MouseEvent;
                      }
    ) => {
        // @ts-ignore
        setCheckedKeys([info.node.key]);
        // @ts-ignore
        onClassCheck([info.node.key])
    };


    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleDeleteClass = async () => {
        setIsModalOpen(false);
        await axios.get(api_url + "/rmclass", {
            params: {
                class_name: editKey,
                user: GetUser(),
                token: GetToken()
            }
        }).then(value => {
            message.success(`Class '${editKey}' deleted!`);
            setNeedToRefetch(true);
            setCheckedKeys([])
            return value.data;
        }).catch(value => {
            message.error(value.response.data)
        })
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        message.info('Nothing done');
    };
    const addChild = async (values: any) => {
        setIsModalOpen(false);
        await axios.get(api_url + "/add_child_class", {
            params: {
                class_name: editKey,
                child_name: values['child'],
                user: GetUser(),
                token: GetToken()
            }
        }).then(value => {
            message.info(`Added '${values['child']}' as child to '${editKey}'`);
            setNeedToRefetch(true);
            return value.data;
        }).catch(value => {
            message.error(value.response.data)
        })
    }
    return (
        <Space direction="vertical">
            <Modal
                onCancel={handleCancel}
                title={`Editing tree node ${editKey}`}
                open={isModalOpen}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        Cancel
                    </Button>,
                    <Popconfirm title="Are you sure?" onConfirm={handleDeleteClass} okText="Yes" placement="rightTop">
                        <Button danger key="submit" type="primary">
                            Delete class {editKey} and all it's children.
                        </Button>
                    </Popconfirm>
                ]}
            >
                <Typography.Text>Add child class</Typography.Text>
                <Form name="basic"
                      labelCol={{span: 8}}
                      wrapperCol={{span: 16}}
                      validateTrigger="onChange"
                      autoComplete="off"
                      onFinish={addChild}>
                    <Form.Item
                        label="Child name"
                        name="child"
                        rules={[{required: true, message: "Child name is required"},
                            {min: 1, message: ">1 symbols"},
                            {max: 100, message: "<100 symbols"}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Button type="primary" htmlType="submit">
                        Add
                    </Button>
                </Form>
            </Modal>
            <Space>
                <EditTwoTone twoToneColor={'green'}/>
                <Typography.Text>Right click tree node to edit.</Typography.Text>
            </Space>
            <Tree
                checkable
                showLine={true}
                onExpand={onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                onCheck={onCheck}
                checkedKeys={checkedKeys}
                showIcon={true}
                icon={
                    // @ts-ignore
                    (props) => {
                        return <EditTwoTone twoToneColor='green' onClick={() => {
                            setEditKey(props.value);
                            showModal();
                        }}/>
                    }
                }
                // @ts-ignore
                onSelect={onSelect}
                defaultExpandAll={true}
                onRightClick={(info: {
                    event: React.MouseEvent;
                    node: TreeDataNode;
                }) => {
                    setEditKey(info.node.key.toString())
                    showModal();
                }}
                treeData={
                    // @ts-ignore
                    data.data
                }
            >
            </Tree>
        </Space>
    )
}