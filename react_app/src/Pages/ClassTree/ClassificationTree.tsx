import React, {useState} from "react";
import {Tree, Typography} from "antd";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {ClockCircleTwoTone} from "@ant-design/icons";

//@ts-ignore
export function ClassificationTree({getUser, getToken, onClassCheck}) {

    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>();
    const [checkedKeys, setCheckedKeys] = useState<React.Key[]>();
    const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
    const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
    const {isLoading, isFetching, error, data} = useQuery(
        {
            queryKey: ["getClassTreeClassificationTree"],
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
    const onExpand = (expandedKeysValue: React.Key[]) => {
        console.log('onExpand', expandedKeysValue);
        // if not set autoExpandParent to false, if children expanded, parent can not collapse.
        // or, you can remove all expanded children keys.
        setExpandedKeys(expandedKeysValue);
        setAutoExpandParent(false);
    };

    const onCheck = (checkedKeysValue: any) => {
        console.log('onCheck', checkedKeysValue);
        setCheckedKeys(checkedKeysValue);
        onClassCheck(checkedKeysValue)
    };

    const onSelect = (selectedKeysValue: React.Key[], info: any) => {
        console.log('onSelect', info);
        setSelectedKeys(selectedKeysValue);
    };

    return (
        <Tree
            checkable
            onExpand={onExpand}
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            onCheck={onCheck}
            checkedKeys={checkedKeys}
            onSelect={onSelect}
            selectedKeys={selectedKeys}
            treeData={
                // @ts-ignore
                data.data
            }
        />
    )
}