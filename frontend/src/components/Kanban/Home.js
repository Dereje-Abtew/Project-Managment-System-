import { selectAuth } from '@/redux/auth/selectors';
import history from '@/utils/history';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import useColumnSearch from '@/hooks/useColumnSearch';
import {
  UnorderedListOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  LockOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  RightCircleOutlined,
  RollbackOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';
import { Badge, Button, Card, Drawer, List, Progress, Result, Skeleton, Table } from 'antd';
import axios from 'axios';

import ProjectDrawer from '@/components/Kanban/ProjectDrawer';

import { API_BASE_URL } from '@/config/serverConfig';
import {
  COMPANY_BLUE_COLOR,
  COMPANY_SECONDARY_COLOR,
  COMPANY_SUCCESS_COLOR,
  COMPANY_YELLOW_COLOR,
} from '@/constants/companyConstants';
import { request } from '@/request';
import cryptoHelper from '@/utils/crypto';
import { erp } from '@/redux/erp/actions';
import { getTwoColors } from '@/utils/helpers';
import { Col, Row } from 'antd';
import dayjs from 'dayjs';
import ProjectCarousel from '../ProjectList';
import SecondaryAlert from '../SecondaryAlert/Index';
axios.defaults.baseURL = API_BASE_URL;

const Home = () => {
  document.title = 'Dashboard - PMS';

  const getColumnSearchProps = useColumnSearch();
  const dispatch = useDispatch();

  const [projects, setProjects] = useState([]);
  const [recordSummary, setRecordSummary] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const projectData = async () => {
    const { result: projectResult } = await request.get({ entity: 'projects' });
    setProjects(projectResult);
    const { result: activeProjectResult } = await request.get({ entity: 'projects/active' });
    setActiveProjects(activeProjectResult);

    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const summary = async () => {
    const { result: summaryResult } = await request.get({ entity: 'project/summary' });

    setRecordSummary(summaryResult);
  };
  useEffect(() => {
    projectData();
    summary();
  }, []);

  const excludedColumns = [
    '_id',
    'removed',
    'description',
    'ownerName',
    'ownerContact',
    'priority',
    'teamLeaderInfo',
    'managerInfo',
    'directorInfo',
    'categoryInfo',
    'teamMemberInfo',
    'teamMemberCount',
    'taskCount',
    'deliverablesCount',
    'qualityAssuranceInfo',
    'achievement',
    'projectNumber',
    'totalBudget',
    'startDate',
    'endDate',
    'actualBudget',
    'methodology',
    'status',
    // Fields added by our listAll fix — arrays/objects that can't render as text
    'task',
    'teamLeader',
    'projectManager',
    'director',
    'teamMember',
    'qualityAssurance',
  ];

  const keys = [];
  if (projects) {
    for (const obj of projects) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key) && !excludedColumns.includes(key)) {
          keys.push(key);
        }
      }
    }
  }

  const uniqueKeys = Array.from(new Set(keys));
  const columns = uniqueKeys.map((key, index) => {
    return {
      title: (
        <span className="font-bold" key={index}>
          {key.charAt(0).toUpperCase() + key.slice(1).replace(/(.)([A-Z])/g, '$1 $2')}
        </span>
      ),
      dataIndex: key,
      key: key,
      ...getColumnSearchProps(key),
      render: (text, record) => {
        // Never try to render an object or array directly — show '-' instead
        if (text === null || text === undefined) return '-';
        if (typeof text === 'object') return '-';
        if (Array.isArray(text)) return '-';
        if (key === 'status') {
          return text.charAt(0).toUpperCase() + text.slice(1);
        }
        return String(text);
      },
    };
  });

  const progress = {
    title: 'Progress',
    dataIndex: 'achievement',
    key: 'achievement',

    render: (text, record) => {
      return (
        <span>
          <Progress
            style={{ minWidth: '200px' }}
            percent={record.achievement}
            strokeColor={getTwoColors()}
          />
        </span>
      );
    },
  };

  columns.push(progress);

  const projectStatus = {
    ONGOING: 'onGoing',
    PENDING: 'pending',
    CLOSED: 'closed',
    ALL: 'all',
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

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedProjectStatus, setSelectedProjectStatus] = useState('');

  const getProjectCount = (type) => {
    if (!Array.isArray(projects)) {
      return 0;
    }

    if (type === 'ALL') {
      return projects.length;
    } else {
      const lowercaseType = type.toLowerCase();
      return projects.filter((project) => String(project.status || '').toLowerCase() === lowercaseType).length;
    }
  };

  const showDrawer = (projectStatus) => {
    setSelectedProjectStatus(projectStatus);
    setIsDrawerVisible(true);
  };

  const closeDrawer = () => {
    setSelectedProjectStatus('');
    setIsDrawerVisible(false);
    setProject(null);
  };

  const [isProjectDrawerVisible, setProjectDrawerVisible] = useState(false);
  const [project, setProject] = useState(null);
  const handleSelectProject = (project) => {
    setProject(project ?? null);
  };
  const currentUserAuth = useSelector(selectAuth) || {};
  const currentUser = currentUserAuth?.current || currentUserAuth;
  const currentUserId = currentUser?.id || currentUser?._id;

  const myProjects =
    projects &&
    projects.filter((item) => {
      if (!currentUserId) return false;

      // Check populated info arrays (from listAll aggregate)
      const isTeamLeader =
        Array.isArray(item.teamLeaderInfo) &&
        item.teamLeaderInfo.some((m) => m?._id === currentUserId);
      const isManager =
        Array.isArray(item.managerInfo) &&
        item.managerInfo.some((m) => m?._id === currentUserId);
      const isDirector =
        Array.isArray(item.directorInfo) &&
        item.directorInfo.some((m) => m?._id === currentUserId);
      const isTeamMember =
        Array.isArray(item.teamMemberInfo) &&
        item.teamMemberInfo.some((m) => m?._id === currentUserId);
      const isQualityAssurance =
        Array.isArray(item.qualityAssuranceInfo) &&
        item.qualityAssuranceInfo.some((m) => m?._id === currentUserId);

      // Also check raw refs (teamLeader, projectManager, director are ObjectIds in listAll)
      const isRawLeader = item.teamLeader?._id === currentUserId || item.teamLeader === currentUserId;
      const isRawManager = item.projectManager?._id === currentUserId || item.projectManager === currentUserId;
      const isRawDirector = item.director?._id === currentUserId || item.director === currentUserId;

      return isTeamLeader || isManager || isDirector || isTeamMember || isQualityAssurance ||
             isRawLeader || isRawManager || isRawDirector;
    });

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
    <div className="m-5 mt-16">
      <ProjectCarousel isFromGuest={false} projects={activeProjects} loading={loading} />
      {isDrawerVisible && (
        <Drawer
          title={
            <SecondaryAlert
              className="mt-3 mb-3"
              message={
                selectedProjectStatus
                  ? projectsDescription[selectedProjectStatus].description
                      .split('. ')[0]
                      .replace('{count}', getProjectCount(selectedProjectStatus))
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
                      String(project.status || '').toLowerCase() ===
                      selectedProjectStatus.toLowerCase()
                  )
                  .map((project, index) => (
                    <List itemLayout="horizontal" key={index}>
                      <List.Item
                        className="link-item-clickable"
                        onClick={() => {
                          handleSelectProject(project);
                          setProjectDrawerVisible(true);
                        }}
                        style={{ paddingLeft: '15px' }}
                        extra={genExtra(project.achievement)}
                      >
                        <List.Item.Meta
                          avatar={<UnorderedListOutlined style={{ fontSize: '140%' }} />}
                          title={project.title}
                          description={`${
                            project.startDate ? dayjs(project.startDate).format('dddd, MMMM D, YYYY') : ''
                          } ➖ ${
                            project.endDate ? dayjs(project.endDate).format('dddd, MMMM D, YYYY') : ''
                          }`}
                        />
                      </List.Item>
                    </List>
                  ))}
              {projects &&
                selectedProjectStatus.toLowerCase() !== 'all' &&
                projects.filter(
                  (project) =>
                    String(project.status || '').toLowerCase() ===
                    selectedProjectStatus.toLowerCase()
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
                      onClick={() => {
                        handleSelectProject(project);
                        setProjectDrawerVisible(true);
                      }}
                      extra={genExtra(project.achievement)}
                      style={{ paddingLeft: '15px' }}
                    >
                      <List.Item.Meta
                        avatar={<UnorderedListOutlined style={{ fontSize: '140%' }} />}
                        title={project.title}
                        description={`${dayjs(project.startDate).format(
                          'dddd, MMMM D, YYYY'
                        )} ➖ ${dayjs(project.endDate).format('dddd, MMMM D, YYYY')}`}
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

          <ProjectDrawer
            project={project}
            isProjectDrawerVisible={isProjectDrawerVisible}
            setProjectDrawerVisible={setProjectDrawerVisible}
          />
        </Drawer>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-2 my-3 xl:grid-cols-4 gap-4">
        {Object.keys(projectStatus).map((status, index) => (
          <Card
            key={index}
            loading={loading}
            className="  relative rounded-md  group overflow-hidden    bg-white shadow-md    dark:bg-gray-900"
          >
            <div aria-hidden="true" className={projectsDescription[status].className}></div>
            <div className="relative">
              <div className="flex justify-between relative *:relative *:size-6 *:m-auto size-12 rounded-lg dark:bg-gray-900 dark:border-white/15 before:rounded-[7px] before:absolute before:inset-0 before:border-t before:border-white before:from-blue-100 dark:before:border-white/20 before:bg-gradient-to-b dark:before:from-white/10 dark:before:to-transparent before:shadow dark:before:shadow-gray-950">
                <h4 className="text-base">{projectsDescription[status].title}</h4>
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
                  className="group rounded-md disabled:border *:select-none [&>*:not(.sr-only)]:relative *:disabled:opacity-20 disabled:text-gray-950 disabled:border-gray-200 disabled:bg-gray-100 dark:disabled:border-gray-800/50 disabled:dark:bg-gray-900 dark:*:disabled:!text-white text-gray-950 bg-gray-200 hover:bg-gray-300 active:bg-gray-100 dark:text-white dark:bg-gray-500/10 dark:hover:bg-gray-500/15 dark:active:bg-gray-500/10 flex gap-1.5 items-center text-sm h-8 px-3.5 justify-center"
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

      <Row gutter={[16, 16]} className="mb-20 ">
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Skeleton
            active
            loading={loading}
            paragraph={{
              rows: 7,
            }}
          >
            <Card title="Projects you enrolled in" className="shadow-lg rounded-lg min-h-full">
              {myProjects && (
                <Table
                  loading={loading}
                  pagination={{
                    defaultPageSize: 4, // Set the default page size
                  }}
                  size="middle"
                  className="max-w-full overflow-x-auto whitespace-nowrap hoverable-table"
                  columns={columns}
                  onRow={(record) => ({
                    onClick: () => {
                      dispatch(erp.currentItem({ data: record }));
                      history.push(`/project/${record._id}`);
                    },
                  })}
                  dataSource={myProjects.map((project) => ({ ...project, key: project._id }))}
                />
              )}
            </Card>
          </Skeleton>
        </Col>{' '}
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Skeleton
            active
            loading={loading}
            paragraph={{
              rows: 7,
            }}
          >
            <Card title="Summary" className="shadow-lg rounded-lg min-h-full">
              <Row gutter={[16, 16]} className="mb-3">
                <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                  <div className="max-w-full p-6 bg-gradient-to-b from-green-200 to-white border rounded-lg shadow">
                    <div className="text-green-600 text-3xl font-bold flex justify-between">
                      <UserAddOutlined />
                      {recordSummary && recordSummary.enabledUserCount}
                    </div>
                    <h4 className="mb-2 text-base font-semibold tracking-tight text-green-600">
                      Enabled Users
                    </h4>
                    <p className="mb-3 font-normal text-green-600">Total number of enabled users</p>
                  </div>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                  <div className="max-w-full p-6 bg-gradient-to-b from-red-200 to-white border rounded-lg shadow">
                    <div className="text-red-600 text-3xl  font-bold flex justify-between">
                      <UserDeleteOutlined />
                      {recordSummary && recordSummary.disabledUserCount}
                    </div>
                    <h4 className="mb-2 text-base font-semibold tracking-tight text-red-600">
                      Disabled Users
                    </h4>
                    <p className="mb-3 font-normal text-red-600">Total number of disabled users</p>
                  </div>
                </Col>
              </Row>
              <Row gutter={[16, 16]} className="mb-3">
                <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                  <div className="bg-gradient-to-tl from-white to-gray-300 p-4 border rounded-lg shadow">
                    <div className="text-blue-600 text-3xl font-bold flex justify-between">
                      <UnorderedListOutlined className="text-gray-700" />
                      {recordSummary && recordSummary.categoriesCount}
                    </div>

                    <div className="mb-2 text-base font-semibold tracking-tight text-gray-700">
                      Project Categories
                    </div>
                    <p className="mb-3 font-normal text-gray-700">Total number of Categories</p>
                  </div>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                  <div className="bg-gradient-to-tl from-white to-gray-300 p-4 border rounded-lg shadow">
                    <div className="text-blue-600 text-3xl font-bold flex justify-between">
                      <LockOutlined className="text-gray-700" />
                      {recordSummary && recordSummary.rolesCount}
                    </div>
                    <div className="mb-2 text-base font-semibold tracking-tight text-gray-700">
                      Available Roles
                    </div>
                    <p className="mb-3 font-normal text-gray-700">Total number of User Roles</p>
                  </div>
                </Col>
              </Row>
            </Card>
          </Skeleton>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
