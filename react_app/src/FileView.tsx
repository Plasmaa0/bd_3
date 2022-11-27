import React from 'react';
import {useLocation, useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import get from "axios";
import {Typography} from "antd";

// @ts-ignore
export function FileView({getToken}) {
    const {user} = useParams<string>();
    const location = useLocation().pathname.split('/');
    location.shift();
    location.shift();
    var loc = ''
    for (const string in location) {
        loc += location[string] + '/'
    }
    while (loc.endsWith('/'))
        loc = loc.slice(0, -1);
    loc = loc.slice(loc.indexOf('/') + 1);
    console.log(loc)
    const {isLoading, isFetching, error, data} = useQuery(["projectPageData"], () =>
        get("http://127.0.0.1:8000/file/" + user + '/' + loc + '?' + new URLSearchParams({token: getToken()}))
            .then((res) => res.data)
    );
    if (isLoading) return (<div><Typography.Title level={2}>FileView:
        user: {user} file: {loc}</Typography.Title><Typography.Text>Loading...</Typography.Text></div>);
    if (isFetching) return (<div><Typography.Title level={2}>FileView:
            user: {user} file: {loc}</Typography.Title><Typography.Text>Fetching...</Typography.Text></div>
    );
    if (error) return (<div><Typography.Title level={2}>FileView:
        {/*@ts-ignore*/}
        user: {user} file: {loc}</Typography.Title><Typography.Text>ERROR {error.message}</Typography.Text></div>);
    return (
        <div><Typography.Title level={2}>FileView: user: {user} file: {loc}</Typography.Title><p style={{color: "cyan"}}
                                                                                                 dangerouslySetInnerHTML={{__html: data['data']}}></p>
        </div>)
}