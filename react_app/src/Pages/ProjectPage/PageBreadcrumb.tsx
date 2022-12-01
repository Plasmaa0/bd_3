import {Link, useLocation} from "react-router-dom";
import {Breadcrumb} from "antd";
import React from "react";

// @ts-ignore
export function PageBreadcrumb({setNeedToRefetch}) {
    const pathSnippets = useLocation().pathname.split('/').filter((i) => i)
    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        return (
            <Breadcrumb.Item key={url}>
                <Link to={url} onClick={() => {
                    setNeedToRefetch(true);
                }}>
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
    return <Breadcrumb>{breadcrumbItems}</Breadcrumb>;
}