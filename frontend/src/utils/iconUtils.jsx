import {
  DashboardOutlined,
  UnorderedListOutlined,
  BranchesOutlined,
  LockOutlined,
  MenuOutlined,
  UserOutlined,
  FileProtectOutlined,
  FolderOpenOutlined,
  SolutionOutlined,
  TeamOutlined,
  BankOutlined,
  BarChartOutlined,
} from '@ant-design/icons';

export const getIconComponent = (iconName) => {
  switch (iconName) {
    case 'Dashboard':
      return <DashboardOutlined />;
    case 'Chief':
      return <UserOutlined />;
    case 'Department':
      return <FolderOpenOutlined />;
    case 'Division':
      return <SolutionOutlined />;
    case 'Project':
      return <UnorderedListOutlined />;
    case 'Task':
        return <BranchesOutlined />;
    case 'Category':
      return <BranchesOutlined />;
    case 'User':
      return <TeamOutlined />;
    case 'Role':
      return <LockOutlined />;
    case 'Report':
      return <FileProtectOutlined />;
    case 'General Report':
      return <BarChartOutlined />;
    case 'Service Provider':
      return <BankOutlined />;
    default:
      return <MenuOutlined />;
  }
};
