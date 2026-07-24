import configPage from './config';
import UpdateRoleModule from '@/modules/RoleModule/UpdateRoleModule';

export default function RoleUpdate() {
  document.title = 'Update Role - PMS';

  const config = {
    ...configPage,
  };
  return <UpdateRoleModule config={config} />;
}
