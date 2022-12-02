import React from 'react';
import {
  RouteObject,
  Navigate,
  Link,
  useLocation,
  useRoutes,
} from 'react-router-dom';
import { Layout, Menu, MenuProps } from 'antd';
import { Home } from './home';
import { FindDiff } from './find-diff';
import './App.less';

const routes: (RouteObject & { name?: string })[] = [
  {
    name: '我的角色',
    path: '/home',
    element: <Home />,
  },
  {
    name: '找茬',
    path: '/find-diff',
    element: <FindDiff />,
  },
];

const mapRoutesToMenu = () => {
  return routes.map((i) => ({
    key: i.path,
    label: <Link to={i.path!}>{i.name}</Link>,
  })) as unknown as Exclude<MenuProps['items'], undefined>;
};

function App() {
  const routesElement = useRoutes([
    { path: '/', element: <Navigate to='/home' /> },
    ...routes,
  ]);
  const location = useLocation();

  return (
    <Layout className='app'>
      <Layout.Sider
        className='sider'
        theme='light'
        collapsible
        collapsedWidth={0}
      >
        <Menu
          theme='light'
          mode='inline'
          defaultSelectedKeys={[location.pathname]}
          items={mapRoutesToMenu()}
        />
      </Layout.Sider>
      <Layout.Content className='content'>{routesElement}</Layout.Content>
    </Layout>
  );
}

export default App;
