import React from 'react';

import ErpContextLayout from '../ErpContextLayout';

import { Layout } from 'antd';

const { Content } = Layout;

export default function ErpLayout({ children, config }) {
  return (
    <ErpContextLayout>
      <Layout className="site-layout">
        <Content
          className="whiteBox shadow layoutPadding"
          style={{
            margin: '60px 2%',
            width: '96%',
            maxWidth: '1900px',
            minHeight: '600px',
          }}
        >
          {children}
        </Content>
      </Layout>
    </ErpContextLayout>
  );
}
