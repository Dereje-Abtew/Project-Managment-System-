import Task from '@/components/Kanban/Task';
import { Layout } from 'antd';

const { Content } = Layout;

export default function TodoRead() {
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
      <Task />
    </Content>
  );
}
