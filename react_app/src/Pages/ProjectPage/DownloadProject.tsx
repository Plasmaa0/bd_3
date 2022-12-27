import {Button, Col, Row, Segmented} from "antd";
import {DownloadOutlined} from "@ant-design/icons";
import {api_url} from "../../Config";
import {useLocation} from "react-router-dom";
import {GetToken, GetUser} from "../../Functions/DataStoring";
import React, {useState} from "react";
import {SegmentedValue} from "antd/es/segmented";

export function DownloadProject() {
    const location = useLocation().pathname.split('/');
    location.shift();
    var loc = ''
    for (const string in location) {
        loc += location[string] + '/'
    }
    while (loc.endsWith('/'))
        loc = loc.slice(0, -1)

    const [extension, setExtension] = useState('zip')
    return (
        <Row justify="space-between" align="middle" gutter={[4, 8]}>
            <Col>
                <Button type="primary"
                        shape="round"
                        icon={<DownloadOutlined/>}
                        size='middle'
                        download={`${loc}_${extension}`}
                        href={`${api_url}/download/${loc}?` + new URLSearchParams({
                            user: GetUser(),
                            token: GetToken(),
                            ext: extension
                        })}
                >
                    Download
                </Button>
            </Col>
            <Col>
                <Segmented
                    options={["zip", "tar", "gztar", "bztar", "xztar"]}
                    defaultValue='zip'
                    onChange={(value: SegmentedValue) => {
                        setExtension(value.toString())
                    }}
                />
            </Col>
        </Row>
    )
}