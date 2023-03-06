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
import {ConfigProvider, Layout, theme, Typography} from "antd";
import ruRU from 'antd/locale/ru_RU'
import enUS from 'antd/locale/en_US'
import {SearchForm} from "../SearchPage/SearchForm";
import {ClassTreeSearch} from "../ClassTree/ClassTreeSearch";
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'
import {GetToken, GetTokenExpire, GetUser, logout} from "../../Functions/DataStoring";
import {isDarkTheme, ThemeSwitcher} from "./ThemeSwitcher";
import {isRussianLanguage, LanguageSwitcher} from "./LanguageSwitcher";
import { TestPage } from '../../other/TestPage';

const {darkAlgorithm, compactAlgorithm, defaultAlgorithm} = theme;

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
    const token_expire: number = GetTokenExpire();
    const [isDarkThemeState, setIsDarkThemeState] = useState(isDarkTheme());
    const [isRussianLanguageState, setIsRussianLanguage] = useState(isRussianLanguage());
    const [collapsed, setCollapsed] = useState(false);
    {
        // console.log(new Date(token_expire*1000))
        // console.log(new Date())
        // console.log(new Date(token_expire*1000) < new Date())
        if (token && new Date(token_expire * 1000) < new Date()) {
            alert("Your token has expired. Please login again.");
            logout();
        }
    }
    // return (
    //     <>

    //         <ConfigProvider theme={{algorithm: isDarkTheme() ? darkAlgorithm : defaultAlgorithm}} locale={isRussianLanguage()?ruRU:enUS}>
    //             <TestPage/>
    //             <LanguageSwitcher isRussian={isRussianLanguage()}
    //                               setIsRussianLanguage={(isRussian) => setIsRussianLanguage(isRussian)}/>
    //         </ConfigProvider>
    //     </>
    // ); //fixme delete this
    if (!token || !user) {
        return (
            <ConfigProvider theme={{algorithm: isDarkTheme() ? darkAlgorithm : defaultAlgorithm}} locale={isRussianLanguage()?ruRU:enUS}>
                <Layout className="box" style={{minHeight: "100vh"}}>
                    <QueryClientProvider client={queryClient}>
                        <BrowserRouter>
                            <Layout.Content className="row content">
                                <Routes>
                                    <Route path="/register" element={<Register/>}/>
                                    <Route path="*"
                                           element={<Login/>}/>
                                </Routes>
                                <ThemeSwitcher isDarkTheme={isDarkTheme()}
                                               setIsDarkTheme={(isDarkTheme) => setIsDarkThemeState(isDarkTheme)}/>
                                <LanguageSwitcher isRussian={isRussianLanguage()}
                                                  setIsRussianLanguage={(isRussian) => setIsRussianLanguage(isRussian)}/>
                            </Layout.Content>
                            <Layout.Footer className="row footer">
                                <Typography.Text>Top 1 file server of the world</Typography.Text>
                            </Layout.Footer>
                        </BrowserRouter>
                    </QueryClientProvider>
                </Layout>
            </ConfigProvider>
        )
    }
    return (
        <ConfigProvider theme={{algorithm: isDarkTheme() ? darkAlgorithm : defaultAlgorithm}} locale={isRussianLanguage()?ruRU:enUS}>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <Layout className="box" style={{minHeight: "100vh"}}>
                        <Layout.Sider collapsible breakpoint="lg" trigger={null} collapsed={collapsed}
                                      onCollapse={(value) => setCollapsed(value)} className="row header">
                            <ThemeSwitcher isDarkTheme={isDarkTheme()}
                                           setIsDarkTheme={(isDarkTheme) => setIsDarkThemeState(isDarkTheme)}/>
                            <LanguageSwitcher isRussian={isRussianLanguage()}
                                              setIsRussianLanguage={(isRussian) => setIsRussianLanguage(isRussian)}/>
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
        </ConfigProvider>
    );
}
