import { useState } from 'react';

import {
  CheckCircleOutlined,
  InfoCircleOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  RightCircleOutlined,
  RollbackOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Badge, Button, Card, Drawer, List, Result } from 'antd';
import axios from 'axios';

import { API_BASE_URL } from '@/config/serverConfig';
import {
  COMPANY_BLUE_COLOR,
  COMPANY_SECONDARY_COLOR,
  COMPANY_SUCCESS_COLOR,
  COMPANY_YELLOW_COLOR,
} from '@/constants/companyConstants';
import SecondaryAlert from '../SecondaryAlert/Index';
axios.defaults.baseURL = API_BASE_URL;

const ProjectCard = ({ projects, loading }) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedProjectStatus, setSelectedProjectStatus] = useState('');

  const showDrawer = (projectStatus) => {
    setSelectedProjectStatus(projectStatus);
    setIsDrawerVisible(true);
  };
  const projectStatus = {
    ONGOING: 'onGoing',
    PENDING: 'pending',
    CLOSED: 'closed',
    ALL: 'all',
  };

  const getProjectCount = (type) => {
    if (type === 'ALL') {
      return projects.length;
    } else {
      const lowercaseType = type.toLowerCase();
      return projects.filter((project) => project.status.toLowerCase() === lowercaseType).length;
    }
  };
  const projectsDescription = {
    ONGOING: {
      title: 'Ongoing Projects',
      description:
        'Here is a list of {count} ongoing projects. Click the "More Info" button to view detail.',
      icon: <PauseCircleOutlined style={{ fontSize: '20px', color: COMPANY_BLUE_COLOR }} />,
      className:
        'inset-0 absolute aspect-video  -translate-y-1/2 group-hover:-translate-y-1/4 duration-300 bg-gradient-to-b from-blue-500 to-white dark:from-white dark:to-white blur-2xl opacity-25 dark:opacity-5 dark:group-hover:opacity-10',
    },
    PENDING: {
      title: 'Pending Projects',
      description:
        'Here is a list of {count} pending projects. Click the "More Info" button to view detail.',
      icon: <PlayCircleOutlined style={{ fontSize: '20px', color: COMPANY_YELLOW_COLOR }} />,
      className:
        'inset-0 absolute aspect-video -translate-y-1/2 group-hover:-translate-y-1/4 duration-300 bg-gradient-to-b from-yellow-500 to-white dark:from-white dark:to-white blur-2xl opacity-25 dark:opacity-5 dark:group-hover:opacity-10',
    },
    CLOSED: {
      title: 'Closed Projects',
      description:
        'Here is a list of {count} closed projects. Click the "More Info" button to view detail.',
      icon: <CheckCircleOutlined style={{ fontSize: '20px', color: COMPANY_SUCCESS_COLOR }} />,
      className:
        'inset-0 absolute aspect-video     -translate-y-1/2 group-hover:-translate-y-1/4 duration-300 bg-gradient-to-b from-green-500 to-white dark:from-white dark:to-white blur-2xl opacity-25 dark:opacity-5 dark:group-hover:opacity-10',
    },
    ALL: {
      title: 'All Projects',
      description:
        'Here is a list of {count} projects. Click the "More Info" button to view detail.',
      icon: <InfoCircleOutlined style={{ fontSize: '20px', color: COMPANY_SECONDARY_COLOR }} />,
      className:
        'inset-0 absolute aspect-video   -translate-y-1/2 group-hover:-translate-y-1/4 duration-300 bg-gradient-to-b from-gray-500 to-white dark:from-white dark:to-white blur-2xl opacity-25 dark:opacity-5 dark:group-hover:opacity-10',
    },
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
  };
  const genExtra = (achievement) => (
    <Badge
      style={{
        backgroundColor: COMPANY_BLUE_COLOR,
        marginRight: '10px',
        borderRadius: '5px',
      }}
      count={achievement + '%'}
    />
  );
  return (
    <>
      {isDrawerVisible && (
        <Drawer
          title={
            <SecondaryAlert
              className="mt-3 mb-3"
              message={
                selectedProjectStatus
                  ? projectsDescription[selectedProjectStatus].description.replace(
                      '{count}',
                      getProjectCount(selectedProjectStatus)
                    )
                  : 'No projects found for the selected status.'
              }
            />
          }
          placement="right"
          width={window.innerWidth > 900 ? window.innerWidth / 2 : window.innerWidth - 100}
          visible={isDrawerVisible}
          onClose={closeDrawer}
          closable={true}
          closeIcon={<RollbackOutlined />}
        >
          {selectedProjectStatus && (
            <>
              {projects &&
                projects
                  .filter(
                    (project) =>
                      project.status.toLowerCase() === selectedProjectStatus.toLowerCase()
                  )
                  .map((project, index) => (
                    <List itemLayout="horizontal" key={index}>
                      <List.Item
                        className="link-item-clickable"
                        style={{ paddingLeft: '15px' }}
                        extra={genExtra(project.achievement)}
                      >
                        <List.Item.Meta
                          avatar={<UnorderedListOutlined style={{ fontSize: '140%' }} />}
                          title={project.title}
                          description={project.description}
                        />
                      </List.Item>
                    </List>
                  ))}
              {projects &&
                selectedProjectStatus.toLowerCase() !== 'all' &&
                projects.filter(
                  (project) => project.status.toLowerCase() === selectedProjectStatus.toLowerCase()
                ).length === 0 && (
                  <Result
                    status="404"
                    title="404"
                    subTitle="Sorry, there is no Project under selected category."
                    extra={
                      <Button type="primary" icon={<RollbackOutlined />} onClick={closeDrawer}>
                        Back
                      </Button>
                    }
                  />
                )}
            </>
          )}
          {selectedProjectStatus && selectedProjectStatus.toLowerCase() === 'all' && (
            <>
              {projects &&
                projects.map((project, index) => (
                  <List itemLayout="horizontal" key={index}>
                    <List.Item
                      className="link-item-clickable"
                      extra={genExtra(project.achievement)}
                      style={{ paddingLeft: '15px' }}
                    >
                      <List.Item.Meta
                        avatar={<UnorderedListOutlined style={{ fontSize: '140%' }} />}
                        title={project.title}
                        description={project.description}
                      />
                    </List.Item>
                  </List>
                ))}

              {projects.length === 0 && (
                <Result
                  status="404"
                  title="404"
                  subTitle="Sorry, there is no Project at all. Please register Projects first."
                  extra={
                    <Button type="primary" icon={<RollbackOutlined />} onClick={closeDrawer}>
                      Back
                    </Button>
                  }
                />
              )}
            </>
          )}
        </Drawer>
      )}

      <div className="grid mt-3 sm:grid-cols-2 lg:grid-cols-2  xl:grid-cols-4 gap-4">
        {Object.keys(projectStatus).map((status) => (
          <Card
            key={status}
            loading={loading}
            className="  relative rounded-md  group overflow-hidden    bg-white shadow-md    dark:bg-gray-900"
          >
            <div aria-hidden="true" className={projectsDescription[status].className}></div>
            <div className="relative">
              <div className="flex justify-between relative *:relative *:size-6 *:m-auto size-12 rounded-lg dark:bg-gray-900 dark:border-white/15 before:rounded-[7px] before:absolute before:inset-0 before:border-t before:border-white before:from-blue-100 dark:before:border-white/20 before:bg-gradient-to-b dark:before:from-white/10 dark:before:to-transparent before:shadow dark:before:shadow-gray-950">
                <h4>{projectsDescription[status].title}</h4>
                <Badge.Ribbon text={getProjectCount(status)}></Badge.Ribbon>
              </div>

              <div className="mt-6 pb-6 rounded-b-[--card-border-radius]">
                <p className="text-gray-700 dark:text-gray-300">
                  {projectsDescription[status].description.replace(
                    '{count}',
                    getProjectCount(status)
                  )}
                </p>
              </div>
              <div className="flex justify-between gap-3 -mb-8 py-6 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => showDrawer(status)}
                  className="group rounded-md disabled:border *:select-none [&>*:not(.sr-only)]:relative *:disabled:opacity-20 disabled:text-gray-950 disabled:border-gray-200 disabled:bg-gray-100 dark:disabled:border-gray-800/50 disabled:dark:bg-gray-900 dark:*:disabled:!text-white text-gray-950 bg-gray-200 hover:bg-gray-200/75 active:bg-gray-100 dark:text-white dark:bg-gray-500/10 dark:hover:bg-gray-500/15 dark:active:bg-gray-500/10 flex gap-1.5 items-center text-sm h-8 px-3.5 justify-center"
                >
                  <RightCircleOutlined key="ellipsis" />
                  <span>More Info</span>
                </button>
                {projectsDescription[status].icon}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
};

export default ProjectCard;
