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
import './App.less';

const routes: (RouteObject & { name?: string })[] = [
  {
    path: '/',
    element: <Navigate to='/home' />,
  },
  {
    name: '我的角色',
    path: '/home',
    element: <Home />,
  },
];

const mapRoutesToMenu = () => {
  return routes.map((i) => ({
    key: i.path,
    label: <Link to={i.path!}>{i.name}</Link>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  })) as any as MenuProps['items'];
};

function App() {
  const routesElement = useRoutes(routes);
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
