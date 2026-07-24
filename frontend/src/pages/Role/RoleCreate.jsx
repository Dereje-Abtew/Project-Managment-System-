import configPage from './config';
import CreateRoleModule from '@/modules/RoleModule/CreateRoleModule';

const config = {
  ...configPage,
};

export default function RoleCreate() {
  document.title = 'Create Role - PMS';

  return <CreateRoleModule config={config} />;
}
