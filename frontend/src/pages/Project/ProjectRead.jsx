import configPage from './config';
import ReadProjectModule from '@/modules/ProjectModule/ReadProjectModule';

export default function ProjectRead() {
  document.title = 'Project Info- PMS';

  const config = {
    ...configPage,
  };
  return <ReadProjectModule config={config} />;
}
