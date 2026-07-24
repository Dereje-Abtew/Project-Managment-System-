import configPage from './config';
import CreateProjectModule from '@/modules/ProjectModule/CreateProjectModule';

const config = {
  ...configPage,
};

export default function ProjectCreate() {
  document.title = 'Create Project - PMS';

  return <CreateProjectModule config={config} />;
}
