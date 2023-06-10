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
import { OZ } from './oz';
import './App.less';
import { FZ } from './fz';

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
  {
    name: '爬塔',
    path: '/oz',
    element: <OZ />,
  },
  {
    name: '卖轮',
    path: '/fz',
    element: <FZ />,
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
      {/* <div */}
      {/*   style={{ */}
      {/*     position: 'fixed', */}
      {/*     top: 0, */}
      {/*     left: 0, */}
      {/*     right: 0, */}
      {/*     bottom: 0, */}
      {/*     pointerEvents: 'none', */}
      {/*     background: */}
      {/*       `url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='100px' width='100px'>` + */}
      {/*       `<text transform='translate(20, 100) rotate(-45)' fill='rgba(45,45,45, 0.5)' font-size='12' >` + */}
      {/*       'QQ 285243000' + */}
      {/*       '</text></svg>")', */}
      {/*   }} */}
      {/* ></div> */}
    </Layout>
  );
}

export default App;
