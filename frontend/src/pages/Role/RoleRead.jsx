import configPage from './config';
import ReadRoleModule from '@/modules/RoleModule/ReadRoleModule';

export default function RoleRead() {
  document.title = 'Read Role - PMS';

  const config = {
    ...configPage,
  };
  return <ReadRoleModule config={config} />;
}
