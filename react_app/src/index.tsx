import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {App} from "./App";
import reportWebVitals from './reportWebVitals';
import {ConfigProvider, theme} from "antd";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

const {darkAlgorithm, compactAlgorithm} = theme;

root.render(
    <React.StrictMode>
        <ConfigProvider theme={{
            token: {
                colorPrimary: '#00b96b',
                colorPrimaryBg: '#284b3b',
                colorSuccess: '#06f585',
                colorWarning: '#f37e09',
                colorError: '#ff0810',
                colorInfo: '#57d2e8',
                colorBgBase: '#0f224d',
                colorTextBase: '#b4ccff',
                colorText: '#b4ccff',
                colorTextSecondary: '#6f92e8',
                colorTextPlaceholder: '#6f92e8',
                colorTextDisabled: '#4d669f',
                colorTextHeading: '#62ffd0',
                colorTextLabel: '#4ac0ff',
                colorTextDescription: '#67b6ee',
                colorTextLightSolid: '#8d94de',
                fontSize: 20
            },
            algorithm: [darkAlgorithm, compactAlgorithm],
        }}>
            <App/>
        </ConfigProvider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
