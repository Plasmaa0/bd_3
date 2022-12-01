import React from "react";
import {Form, Input, Button, message, Select, Tag, TreeSelect, Typography} from "antd";
import {tags_for_antd_select} from "../Util/tags_complete";
import {CustomTagProps} from "rc-select/lib/BaseSelect";
import {UniqueColorFromString} from "../Util/Utils";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {ClockCircleTwoTone} from "@ant-design/icons";

// @ts-ignore
export function AddProjectForm({existingProjects, user, getToken, setNeedToRefetch, getUser, loc = ''}) {
    // TODO validate that name not in existingProjects
    var selectedTagsSet = new Set();
    const handleSubmit = async (values: any) => {
        var path: string
        if (loc.length > 0) {
            path = "http://127.0.0.1:8000/mkdir/" + user + '/' + loc + '/' + values['name'] + '?' + new URLSearchParams({
                token: getToken(),
                tags: Array.from(selectedTagsSet).join(','),
                user: getUser()
            })
        } else {
            path = "http://127.0.0.1:8000/mkdir/" + user + '/' + values['name'] + '?' + new URLSearchParams({
                token: getToken(),
                tags: Array.from(selectedTagsSet).join(','),
                user: getUser()
            })
        }
        const s = await axios.post(path, values['class'])
            .then((res) => res.status)
        if (s === 200) {
            setNeedToRefetch(true)
            message.success(`Added new project ${values['name']}`)
        }
    }
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
    const {isLoading, isFetching, error, data} = useQuery(
        {
            queryKey: ["getClassTreeAddProjectForm"],
            queryFn: async () => {
                return await axios.get("http://127.0.0.1:8000/class_tree", {
                    params: {
                        user: getUser(),
                        token: getToken()
                    }
                })
            }
        }
    )
    if (isLoading) return (<ClockCircleTwoTone spin twoToneColor={"lime"} style={{fontSize: '25px'}}/>);
    if (isFetching) return (<ClockCircleTwoTone spin twoToneColor={"lime"} style={{fontSize: '25px'}}/>);
    if (error) { // @ts-ignore
        return (<Typography.Text>{error.response.data}</Typography.Text>);
    }
    return (
        <Form
            name="basic"
            labelCol={{span: 8}}
            wrapperCol={{span: 16}}
            validateTrigger="onChange"
            autoComplete="off"
            onFinish={handleSubmit}
        >
            <Form.Item
                label="Name"
                name="name"
                rules={[{required: true, message: "name is required"},
                    {pattern: /^(?=[a-zA-Z0-9._]{3,60}$)(?!.*[_.]{2})[^_.].*[^_.]$/, message: "invalid name"}]}
            >
                <Input/>
            </Form.Item>
            <Form.Item
                label="Tags"
                name="tags"
            >
                <Select
                    mode="tags"
                    showArrow
                    tagRender={tagRender}
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
            </Form.Item>
            <Form.Item
                label="Class"
                name="class"
                rules={[{required: true, message: "Class is required"}]}>
                <TreeSelect
                    showSearch
                    placeholder="Please select"
                    allowClear
                    multiple
                    treeCheckable={true}
                    showCheckedStrategy={"SHOW_PARENT"}
                    treeData={
                        // @ts-ignore
                        data.data
                    }
                />
            </Form.Item>
            <Form.Item wrapperCol={{offset: 8, span: 16}}>
                <Button type="primary" htmlType="submit">
                    Add
                </Button>
            </Form.Item>
        </Form>
    );
}