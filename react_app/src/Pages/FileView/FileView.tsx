import React from 'react';
import {Link, useLocation, useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import get from "axios";
import {Breadcrumb, Typography} from "antd";

// @ts-ignore
export function FileView({getToken, getUser}) {
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

    const pathSnippets = useLocation().pathname.split('/').filter((i) => i)
    pathSnippets.shift()
    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
        let url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        if (index === pathSnippets.length - 1)
            url = '/file' + url
        return (
            <Breadcrumb.Item key={url}>
                <Link to={url}>
                    {pathSnippets[index]}
                </Link>
            </Breadcrumb.Item>
        );
    });
    const breadcrumbItems = [
        <Breadcrumb.Item key="home">
            <Link to="/">Home</Link>
        </Breadcrumb.Item>,
    ].concat(extraBreadcrumbItems);

    loc = loc.slice(loc.indexOf('/') + 1);
    console.log(loc)
    const {isLoading, isFetching, error, data} = useQuery(["fileData"], () =>
        get("http://127.0.0.1:8000/file/" + user + '/' + loc + '?' + new URLSearchParams({
            token: getToken(),
            user: getUser()
        }))
            .then((res) => res.data)
    );


    if (isLoading) return (
        <div>
            <Breadcrumb>{breadcrumbItems}</Breadcrumb>
            <Typography.Title level={2}>
                FileView: user: {user} file: {loc}
            </Typography.Title>
            <Typography.Text>
                Loading...
            </Typography.Text>
        </div>);
    if (isFetching) return (
        <div>
            <Breadcrumb>{breadcrumbItems}</Breadcrumb>
            <Typography.Title level={2}>
                FileView: user: {user} file: {loc}
            </Typography.Title>
            <Typography.Text>
                Fetching...
            </Typography.Text>
        </div>
    );
    if (error) return (
        <div>
            <Breadcrumb>{breadcrumbItems}</Breadcrumb>
            <Typography.Title level={2}>
                FileView:
                user: {user} file: {loc}
            </Typography.Title>
            <Typography.Text>
                {/*@ts-ignore*/}
                ERROR {error.message}
            </Typography.Text>
        </div>);
    return (
        <div>
            <Breadcrumb>{breadcrumbItems}</Breadcrumb>
            <Typography.Title level={2}>FileView: user: {user} file: {loc}</Typography.Title>
            <p style={{color: "cyan"}}
               dangerouslySetInnerHTML={{__html: data['data']}}>
            </p>
        </div>)
}