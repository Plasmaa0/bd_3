import React from 'react';
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

function setToken(userToken: string) {
    sessionStorage.setItem('token', JSON.stringify(userToken));
}

function setUser(username: string) {
    sessionStorage.setItem('user', JSON.stringify(username));
}

function setRole(username: string) {
    sessionStorage.setItem('role', JSON.stringify(username));
}

function getToken() {
    // @ts-ignore
    const tokenString: string = sessionStorage.getItem('token')?.replaceAll('"', '');
    return tokenString;
}

function getUser() {
    // @ts-ignore
    const userString: string = sessionStorage.getItem('user')?.replaceAll('"', '');
    return userString;
}

function getRole() {
    // @ts-ignore
    const tokenString: string = sessionStorage.getItem('role')?.replaceAll('"', '');
    return tokenString;
}

export function App() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                retry: 0
            },
        },
    })
    const token: string = getToken();
    const user: string = getUser();
    if (!token || !user) {
        return (
            <Layout className="box">
                <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                        <Layout.Content className="row content">
                            <Routes>
                                <Route path="/"
                                       element={<Login setToken={setToken} setUser={setUser} setRole={setRole}/>}/>
                                <Route path="/login"
                                       element={<Login setToken={setToken} setUser={setUser} setRole={setRole}/>}/>
                                <Route path="/register" element={<Register/>}/>
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
        <Layout className="box">
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <Layout.Header className="row header">
                        <Navbar getUser={getUser}/>
                    </Layout.Header>
                    <Layout.Content className="row content">
                        <Routes>
                            <Route path="/" element={<Home/>}/>
                            <Route path="/login"
                                   element={<Login setToken={setToken} setUser={setUser} setRole={setRole}/>}/>
                            <Route path="/register" element={<Register/>}/>
                            <Route path="/class-tree" element={<ClassTreeSearch getUser={getUser} getToken={getToken}/>}/>
                            <Route path="/search"
                                   element={<SearchForm getToken={getToken} getUser={getUser} getRole={getRole}/>}/>
                            <Route path="/:user" element={<UserPage getToken={getToken} getUser={getUser}/>}/>
                            <Route path="/:user/:project_path/*"
                                   element={<ProjectPage getToken={getToken} getUser={getUser}/>}/>
                            <Route path="/file/:user/*" element={<FileView getToken={getToken} getUser={getUser}/>}/>
                            <Route path='*' element={<Page404/>}/>
                        </Routes>
                    </Layout.Content>
                    <Layout.Footer className="row footer">
                        <Typography.Text>Top 1 file server of the world</Typography.Text>
                    </Layout.Footer>
                </BrowserRouter>
                <ReactQueryDevtools initialIsOpen={true}/>
            </QueryClientProvider>
        </Layout>
    );
}
