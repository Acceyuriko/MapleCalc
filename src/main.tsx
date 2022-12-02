import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'antd/dist/antd.less';
import App from './App';
import './index.less';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter basename='MapleCalc'>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
