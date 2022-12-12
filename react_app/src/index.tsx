import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import {App} from "./Pages/Global/App";
import reportWebVitals from './other/reportWebVitals';
import {ConfigProvider, theme} from "antd";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

const {darkAlgorithm, compactAlgorithm, defaultAlgorithm} = theme;

root.render(
    <React.StrictMode>
        <ConfigProvider theme={{
            token: {
                // colorPrimary: '#37b08f',
                // colorPrimaryBg: '#1c463d',
                // colorSuccess: '#06f585',
                // colorWarning: '#f37e09',
                // colorError: '#ff0005',
                // colorInfo: '#3c5180',
                // colorBgBase: '#d2d6e3',
                // colorTextBase: '#33394d',
                // colorText: '#0e0842',
                // colorTextSecondary: '#6f92e8',
                // colorTextPlaceholder: '#6f92e8',
                // colorTextDisabled: '#4d669f',
                // colorTextHeading: '#62ffd0',
                // colorTextLabel: '#4ac0ff',
                // colorTextDescription: '#67b6ee',
                // colorTextLightSolid: '#8d94de',
                fontSize: 20
            },
            algorithm: [defaultAlgorithm, compactAlgorithm],
        }}>
            <App/>
        </ConfigProvider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
