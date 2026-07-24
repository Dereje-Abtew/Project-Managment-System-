import Report from '@/components/Kanban/Report';
import React from 'react';
import { Layout } from 'antd';

const { Content } = Layout;
function TodoReport() {
  document.title = 'Report- PMS';

  return (
    <Content
      className="whiteBox shadow layoutPadding"
      style={{
        margin: '60px 2%',
        width: '96%',
        maxWidth: '1900px',
        flex: 'none',
      }}
    >
      <Report />
    </Content>
  );
}

export default TodoReport;
