import React, {useState} from "react";
import {Button, message, Modal, Select, Space, Tag, Tooltip} from "antd";
import {EditOutlined} from "@ant-design/icons";
import get from "axios";
import {tags_for_antd_select} from "./tags_complete";
import {CustomTagProps} from "rc-select/lib/BaseSelect";
import {UniqueColorFromString} from "./Utils";

// @ts-ignore
export function EditTags({data, user, loc, getToken, getUser, setNeedToRefetch}) {

    const [isModalOpen, setIsModalOpen] = useState(false); // edit tags modal

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
        const path = `http://virtual.fn11.bmstu.ru:3006/edit_tags/${user}/${loc}?` +
            // @ts-ignore
            new URLSearchParams({
                token: getToken(), tags: new_tags,
                user: getUser()
            })
        const s = await get(path).then(value => value.data).catch(value => value.response)
        if (s.data) {
            message.error(s.data)
        } else {
            message.success("Tags updated!")
            setNeedToRefetch(true)
        }
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
        <Space>
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
    )
}