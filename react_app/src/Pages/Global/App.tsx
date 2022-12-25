import React, {useState} from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import '../../styles/App.css';
import 'antd/dist/reset.css'
import {Login} from "../Auth/Login";
import {Register} from "../Auth/Register";
import {ProjectPage} from "../ProjectPage/ProjectPage";
import {Home} from "./Home";
import {Page404} from "./Page404";
import {Navbar} from "./Navbar";
import {UserPage} from "../UserPage/UserPage";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {FileView} from "../FileView/FileView";
import {Layout, Typography} from "antd";
import {SearchForm} from "../SearchPage/SearchForm";
import {ClassTreeSearch} from "../ClassTree/ClassTreeSearch";
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'
import {GetToken, GetUser} from "../../Functions/DataStoring";

export function App() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                retry: 0
            },
        },
    })
    const token: string = GetToken();
    const user: string = GetUser();
    const [collapsed, setCollapsed] = useState(false);
    // return (<TestPage/>); //fixme delete this
    if (!token || !user) {
        return (
            <Layout className="box">
                <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                        <Layout.Content className="row content">
                            <Routes>
                                <Route path="/register" element={<Register/>}/>
                                <Route path="*"
                                       element={<Login/>}/>
                            </Routes>
                        </Layout.Content>
                        <Layout.Footer className="row footer">
                            <Typography.Text>Top 1 file server of the world</Typography.Text>
                        </Layout.Footer>
                    </BrowserRouter>
                </QueryClientProvider>
            </Layout>
        )
    }
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Layout className="box">
                    <Layout.Sider collapsible breakpoint="lg" trigger={null} collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} className="row header">
                        <Navbar collapsed={collapsed} setCollapsed={setCollapsed}/>
                    </Layout.Sider>
                    <Layout>
                        <Layout.Content className="row content">
                            <Routes>
                                <Route path="/" element={<Home/>}/>
                                <Route path="/login"
                                       element={<Login/>}/>
                                <Route path="/register" element={<Register/>}/>
                                <Route path="/class-tree"
                                       element={<ClassTreeSearch/>}/>
                                <Route path="/search"
                                       element={<SearchForm/>}/>
                                <Route path="/:user" element={<UserPage/>}/>
                                <Route path="/:user/:project_path/*"
                                       element={<ProjectPage/>}/>
                                <Route path="/file/:user/*" element={<FileView/>}/>
                                <Route path='*' element={<Page404/>}/>
                            </Routes>
                        </Layout.Content>
                        <Layout.Footer className="row footer">
                            <Typography.Text>Top 1 file server of the world</Typography.Text>
                        </Layout.Footer>
                    </Layout>
                </Layout>
            </BrowserRouter>
            <ReactQueryDevtools initialIsOpen={true}/>
        </QueryClientProvider>
    );
}
