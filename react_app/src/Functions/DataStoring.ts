import Cookies from 'universal-cookie';
import {message} from "antd";

const cookies = new Cookies();

export function GetToken() {
    return cookies.get('token')
}

export function GetUser() {
    return cookies.get('user')
}

export function GetRole() {
    return cookies.get('role')
}

export function GetTokenExpire() {
    return cookies.get('token_expire')
}

export function logout() {
    message.warning("logout")
    cookies.remove('token')
    cookies.remove('user')
    cookies.remove('role')
    window.location.reload();
}