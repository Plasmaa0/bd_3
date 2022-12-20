import {Button} from "antd";
import {DownloadOutlined} from "@ant-design/icons";
import { api_url } from "../ClassTree/Config";
import { getToken, getUser } from "../Global/App";
import { useLocation } from "react-router-dom";

export function DownloadProject() {
    const location = useLocation().pathname.split('/');
    location.shift();
    var loc = ''
    for (const string in location) {
        loc += location[string] + '/'
    }
    while (loc.endsWith('/'))
        loc = loc.slice(0, -1)
   return (
        <Button type="primary"
                shape="round"
                icon={<DownloadOutlined/>}
                size='middle'
                href={`${api_url}/download/${loc}?`+ new URLSearchParams({user: getUser(), token:getToken()})}
        >
            Download
        </Button>
    )
}