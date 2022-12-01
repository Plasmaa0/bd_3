import React, {useEffect, useState} from "react";
import {Divider, InputNumber, Layout, message, Space, Tree, Typography} from "antd";
import {useMutation, useQuery} from "@tanstack/react-query";
import axios from "axios";
import {ClockCircleTwoTone} from "@ant-design/icons";
import {ClassificationTree} from "./ClassificationTree";
import {ProjectsTable} from "../Tables/ProjectsTable";

// @ts-ignore
export function ClassTreeSearch({getUser, getToken}) {
    const [needToRefetch, setNeedToRefetch] = useState(true);
    const {isLoading, isFetching, isPaused, error, data, refetch} = useQuery(
        {
            queryKey: ["getClassTree"],
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

    useEffect(() => {
        if (needToRefetch) {
            refetch().then((res) => res.data);
        }
        setNeedToRefetch(false);
    }, [needToRefetch]);

    const [searchData, setSearchData] = useState([]);
    const mutation = useMutation(
        {
            mutationKey: ["filterMutation"],
            mutationFn: async variables => {
                return await axios.post("http://127.0.0.1:8000/classification", variables, {
                    params: {
                        user: getUser(),
                        token: getToken()
                    }
                })
            },
            onSuccess: async data1 => {
                // @ts-ignore
                setSearchData(data1.data)
                message.success('success')
            },
            onError: async error1 => {
                message.error('error')
            }
        }
    )

    if (isPaused) return (<Typography.Text>Paused</Typography.Text>);
    if (isLoading) return (<ClockCircleTwoTone spin twoToneColor={"lime"} style={{fontSize: '50px'}}/>);
    if (isFetching) return (<ClockCircleTwoTone spin twoToneColor={"lime"} style={{fontSize: '50px'}}/>);
    if (error) { // @ts-ignore
        return (<Typography.Text>{error.text}</Typography.Text>);
    }

    return (
        <Space align="start">
            <Space direction="vertical">
                <Typography.Title>Class tree</Typography.Title>
                <ClassificationTree getToken={getToken} getUser={getUser} onClassCheck={(checkedValues: void) => {
                    mutation.mutate(checkedValues)
                }}/>
            </Space>
            <Divider type="vertical"/>
            <Space direction="vertical">
                <Typography.Title>Projects</Typography.Title>
                {/*// @ts-ignore TODO FIXME !!! repair/implement me!!*/}
                <ProjectsTable data={searchData}/>
            </Space>
        </Space>
    )
}