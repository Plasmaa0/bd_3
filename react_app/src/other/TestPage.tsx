import React, {useState} from "react";
import {
    FloatButton,
    Space,
    Typography,
    Button,
    Divider,
    Layout,
    Breadcrumb,
    Menu,
    MenuProps,
    Dropdown,
    Pagination,
    Steps,
    Checkbox,
    DatePicker,
    Input,
    Slider,
    Switch,
    Badge,
    Avatar,
    Collapse,
    Popover,
    Segmented,
    Table,
    Tabs,
    Tag,
    Timeline,
    Tooltip,
    Tree,
    Alert,
    message,
    notification,
    Popconfirm,
    Progress,
    Skeleton,
    Spin
} from "antd";
import {
    PlusCircleOutlined,
    UpCircleFilled,
    BulbTwoTone,
    HomeOutlined,
    UserOutlined,
    DownOutlined,
    ClockCircleOutlined
} from "@ant-design/icons"
import type {DataNode} from 'antd/es/tree';


export function TestPage() {
    const [messageApi, contextHolder] = message.useMessage();

    const success = () => {
        messageApi.open({
            type: 'success',
            content: 'This is a success message',
        });
    };

    const error = () => {
        messageApi.open({
            type: 'error',
            content: 'This is an error message',
        });
    };

    const warning = () => {
        messageApi.open({
            type: 'warning',
            content: 'This is a warning message',
        });
    };
    const info = () => {
        messageApi.info({
            type: 'warning',
            content: 'This is a info message',
        });
    };
    const loading = () => {
        messageApi.loading({
            type: 'warning',
            content: 'This is a laoding message',
        });
    };
    const dataSource = [
        {
            key: '1',
            name: 'Mike',
            age: 32,
            address: '10 Downing Street',
        },
        {
            key: '2',
            name: 'John',
            age: 42,
            address: '10 Downing Street',
        },
    ];
    const treeData: DataNode[] = [
        {
            title: 'parent 1',
            key: '0-0',
            children: [
                {
                    title: 'parent 1-0',
                    key: '0-0-0',
                    disabled: true,
                    children: [
                        {
                            title: 'leaf',
                            key: '0-0-0-0',
                            disableCheckbox: true,
                        },
                        {
                            title: 'leaf',
                            key: '0-0-0-1',
                        },
                    ],
                },
                {
                    title: 'parent 1-1',
                    key: '0-0-1',
                    children: [{title: <span style={{color: '#1890ff'}}>sss</span>, key: '0-0-1-0'}],
                },
            ],
        },
    ];
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
        },
    ];
    const items: MenuProps['items'] = [
        {
            label: <a>1st menu item</a>,
            key: '0',
        },
        {
            label: <a>2nd menu item</a>,
            key: '1',
        },
        {
            type: 'divider',
        },
        {
            label: '3rd menu item',
            key: '3',
        },
    ];
    const [show, setShow] = useState(true);
    return (
        <Layout>
            <Layout.Header>
                <Typography.Title>header</Typography.Title>
            </Layout.Header>
            <Layout>
                <Layout.Sider>
                    <Typography.Title>Sider</Typography.Title>
                </Layout.Sider>
                <Layout.Content>
                    <Menu>
                        <Menu.Item>Menu item 1</Menu.Item>
                        <Menu.Item>Menu item 2</Menu.Item>
                    </Menu>
                    <Breadcrumb>
                        <Breadcrumb.Item href="">
                            <HomeOutlined/>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item href="">
                            <UserOutlined/>
                            <span>Application List</span>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>Application</Breadcrumb.Item>
                    </Breadcrumb>
                    <Dropdown menu={{items}} trigger={['click']}>
                        <a onClick={(e) => e.preventDefault()}>
                            <Space>
                                Click me
                                <DownOutlined/>
                            </Space>
                        </a>
                    </Dropdown>
                    <Tabs>
                        <Tabs.TabPane tab="tab 1" key="tab1">
                            <Space direction="vertical">
                                <Typography.Title>TitleTitleTitleTitle</Typography.Title>
                                <Typography.Text>TextTextTextText</Typography.Text>
                                <Typography.Paragraph>ParagraphParagraphParagraphParagraph</Typography.Paragraph>
                                <Typography.Link>LinkLinkLinkLink</Typography.Link>
                                <FloatButton description="Float button" shape="square"/>
                            </Space>
                            <Divider type="vertical"/>
                            <Space direction="vertical">
                                <Space>
                                    <Button type="primary">Primary</Button>
                                    <Button type="primary" disabled>
                                        Primary(disabled)
                                    </Button>
                                </Space>
                                <Space>
                                    <Button>Default</Button>
                                    <Button disabled>Default(disabled)</Button>
                                </Space>
                                <Space>
                                    <Button type="dashed">Dashed</Button>
                                    <Button type="dashed" disabled>
                                        Dashed(disabled)
                                    </Button>
                                </Space>
                                <Space>
                                    <Button type="text">Text</Button>
                                    <Button type="text" disabled>
                                        Text(disabled)
                                    </Button>
                                </Space>
                                <Space>
                                    <Button type="link">Link</Button>
                                    <Button type="link" disabled>
                                        Link(disabled)
                                    </Button>
                                </Space>
                                <Space>
                                    <Button danger>Danger Default</Button>
                                    <Button danger disabled>
                                        Danger Default(disabled)
                                    </Button>
                                </Space>
                                <Space>
                                    <Button danger type="text">
                                        Danger Text
                                    </Button>
                                    <Button danger type="text" disabled>
                                        Danger Text(disabled)
                                    </Button>
                                </Space>
                                <Space>
                                    <Button type="link" danger>
                                        Danger Link
                                    </Button>
                                    <Button type="link" danger disabled>
                                        Danger Link(disabled)
                                    </Button>
                                </Space>
                                <Space className="site-button-ghost-wrapper">
                                    <Button ghost>Ghost</Button>
                                    <Button ghost disabled>
                                        Ghost(disabled)
                                    </Button>
                                </Space>
                            </Space>
                            <Space direction="vertical">
                                <Typography.Title>Icons</Typography.Title>
                                <Space direction="horizontal">Outlined<PlusCircleOutlined/></Space>
                                <Space direction="horizontal">Filled<UpCircleFilled/></Space>
                                <Space direction="horizontal">TwoTone<BulbTwoTone/></Space>
                            </Space>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="tab 2" key="tab2">
                            <Space direction="vertical">
                                <Typography.Text>Pagination</Typography.Text>
                                <Pagination defaultCurrent={1} total={50}/>
                            </Space>
                            <Space direction="vertical">
                                <Typography.Text>Steps</Typography.Text>
                                <Steps>
                                    <Steps.Step title="first step"/>
                                    <Steps.Step title="second step"/>
                                    <Steps.Step title="third step"/>
                                </Steps>
                            </Space>
                            <Space direction="vertical">
                                <Checkbox>Checkbox</Checkbox>
                                <DatePicker/>
                            </Space>
                            <Space direction="vertical">
                                <Input placeholder="Normal"/>
                                <Input status="error" placeholder="Error"/>
                                <Input status="warning" placeholder="Warning"/>
                            </Space>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="tab 3" key="tab3">
                            <Space direction="vertical">
                                <Slider defaultValue={30} style={{width: "200px"}}/>
                                <Slider defaultValue={30} disabled={true} style={{width: "200px"}}/>
                            </Space>
                            <Space direction="vertical">
                                <Badge count={5}>
                                    <Avatar shape="square" size="large"/>
                                </Badge>
                                <Badge count={0} showZero>
                                    <Avatar shape="square" size="large"/>
                                </Badge>
                                <Badge count={<ClockCircleOutlined style={{color: '#f5222d'}}/>}>
                                    <Avatar shape="square" size="large"/>
                                </Badge>
                                <Space>
                                    <Switch checked={show} onChange={() => setShow(!show)}/>
                                    <Badge count={show ? 11 : 0} showZero color='#faad14'/>
                                    <Badge count={show ? 25 : 0}/>
                                    <Badge count={show ? <ClockCircleOutlined style={{color: '#f5222d'}}/> : 0}/>
                                    <Badge
                                        className="site-badge-count-109"
                                        count={show ? 109 : 0}
                                        style={{backgroundColor: '#52c41a'}}
                                    />
                                </Space>
                            </Space>
                            <Space direction="vertical">
                                <Collapse defaultActiveKey={['1']}>
                                    <Collapse.Panel header="Collapse 1" key="1">
                                        <p>Text Text Collapse 1</p>
                                    </Collapse.Panel>
                                    <Collapse.Panel header="Collapse 2" key="2">
                                        <p>Text Text Collapse 2</p>
                                    </Collapse.Panel>
                                    <Collapse.Panel header="Collapse 3" key="3">
                                        <p>Text Text Collapse 3</p>
                                    </Collapse.Panel>
                                </Collapse>
                                <Popover content={"Text: hello"} title="Title">
                                    <Button type="primary">Hover me</Button>
                                </Popover>
                                <Space>
                                    <Typography.Text>Switch me:</Typography.Text>
                                    <Segmented options={['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly']}/>
                                </Space>
                            </Space>
                            <Space direction="vertical">
                                <Table dataSource={dataSource} columns={columns}/>;
                            </Space>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="tab 4" key="tab4">
                            <Tag>Tag 1</Tag>
                            <Tag>Tag 2</Tag>
                            <Tag closable={true}>Tag 3</Tag>
                            <Timeline>
                                <Timeline.Item>Create a services site 2015-09-01</Timeline.Item>
                                <Timeline.Item>Solve initial network problems 2015-09-01</Timeline.Item>
                                <Timeline.Item>Technical testing 2015-09-01</Timeline.Item>
                                <Timeline.Item>Network problems being solved 2015-09-01</Timeline.Item>
                            </Timeline>
                            <Tooltip title="Tooltip!!">
                                <Button>
                                    HOWER ME!
                                </Button>
                            </Tooltip>
                            <Tree
                                checkable
                                defaultExpandedKeys={['0-0-0', '0-0-1']}
                                defaultSelectedKeys={['0-0-0', '0-0-1']}
                                defaultCheckedKeys={['0-0-0', '0-0-1']}
                                treeData={treeData}
                            />
                        </Tabs.TabPane>

                        <Tabs.TabPane tab="tab 5" key="tab5">
                            <Space direction="vertical" style={{width: '100%'}}>
                                <Alert message="Success Text" type="success"/>
                                <Alert message="Info Text" type="info"/>
                                <Alert message="Warning Text" type="warning"/>
                                <Alert message="Error Text" type="error"/>
                            </Space>
                            <Space>
                                {contextHolder}
                                <Space>
                                    <Button onClick={success}>Success PRESS ME</Button>
                                    <Button onClick={error}>Error PRESS ME</Button>
                                    <Button onClick={warning}>Warning PRESS ME</Button>
                                    <Button onClick={info}>info PRESS ME</Button>
                                    <Button onClick={loading}>loading PRESS ME</Button>
                                </Space>
                            </Space>
                            <Space>
                                <Popconfirm
                                    title="PRESS YES TO SEE NOTIFICATION, OR PRESS NO TO NOT"
                                    onConfirm={e => {
                                        notification.open({
                                            message: 'Notification Title',
                                            description:
                                                'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
                                            onClick: () => {
                                                message.info('Notification Clicked!');
                                            },
                                            onClose: () => {
                                                message.warning('Notification Closed!');
                                            }
                                        });
                                    }}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button>Click me</Button>
                                </Popconfirm>
                            </Space>
                            <Space wrap>
                                <Progress type="circle" percent={75}/>
                                <Progress type="circle" percent={70} status="exception"/>
                                <Progress type="circle" percent={100}/>
                            </Space>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="tab 6" key="tab6">
                            <Typography.Text>Skeleton:</Typography.Text>
                            <Skeleton/>
                            <Space direction="vertical">
                                <Typography.Text>Крутящаяся иконка поверх другого элемента</Typography.Text>
                                <Spin tip="Loading" size="large">
                                    <Typography.Title>I AM LOADING</Typography.Title>
                                </Spin>
                            </Space>
                        </Tabs.TabPane>
                    </Tabs>
                </Layout.Content>
            </Layout>
            <Layout.Footer>
                <Typography.Text>Footer</Typography.Text>
            </Layout.Footer>
        </Layout>
    );
}