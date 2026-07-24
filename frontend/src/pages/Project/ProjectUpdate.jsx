import configPage from './config';
import UpdateProjectModule from '@/modules/ProjectModule/UpdateProjectModule';

export default function ProjectUpdate() {
  document.title = 'Update Project - PMS';

  const config = {
    ...configPage,
  };
  return <UpdateProjectModule config={config} />;
}
