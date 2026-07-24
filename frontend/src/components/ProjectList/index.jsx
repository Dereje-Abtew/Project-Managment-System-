import {
  BranchesOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined,
  OrderedListOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Card,
  Carousel,
  Col,
  Divider,
  Progress,
  Row,
  Skeleton,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import axios from 'axios';

import { API_BASE_URL } from '@/config/serverConfig';
import {
  COMPANY_BLUE_COLOR,
  COMPANY_SECONDARY_COLOR,
  COMPANY_WHITE_COLOR,
} from '@/constants/companyConstants';
import { ONGOING_LABEL } from '@/constants/kanbanBoardCardLabels';
import { getTwoColors } from '@/utils/helpers';
import PieChart from '../Kanban/PieChart';
axios.defaults.baseURL = API_BASE_URL;
const { Title } = Typography;

const ProjectCarousel = ({ projects, loading, isFromGuest }) => {
  return (
    <Skeleton
      className="mb-3 "
      active
      loading={loading}
      avatar
      paragraph={{
        rows: 7,
      }}
    >
      <Carousel loading={loading} autoplay>
        {projects &&
          projects
            .filter((project) => project.status.toUpperCase() === ONGOING_LABEL.toUpperCase())
            .map((project, index) => (
              <div key={index}>
                <div className="text-blue-500 leading-normal text-center bg-white border border-yellow-500 rounded-md">
                  <Row align="center">
                    <Col span={6} className="m-3">
                      <PieChart project={project} />
                    </Col>
                    <Col span={17}>
                      <Badge.Ribbon
                        color={COMPANY_BLUE_COLOR}
                        text={
                          <Tag
                            style={{ fontSize: '15px' }}
                            color={COMPANY_BLUE_COLOR}
                            icon={<CheckCircleOutlined />}
                          >
                            {project.achievement + '%'}
                          </Tag>
                        }
                      >
                        <Card
                          bordered={false}
                          style={{ backgroundColor: COMPANY_WHITE_COLOR }}
                          title={
                            <>
                              <Title style={{ textAlign: 'center' }} level={3}>
                                {project.title}
                              </Title>
                              <Progress
                                trailColor={COMPANY_SECONDARY_COLOR}
                                type="line"
                                showInfo={false}
                                percent={project.achievement}
                                strokeColor={getTwoColors()}
                              />
                            </>
                          }
                          size="small"
                        >
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <p style={{ flex: '7' }}>
                              Lead by:
                              {project.teamLeaderInfo &&
                                project.teamLeaderInfo[0] &&
                                ` ${project.teamLeaderInfo[0].firstName} ${project.teamLeaderInfo[0].lastName}`}
                              {project.projectManager &&
                                ` ${project.projectManager?.firstName} ${project.projectManager?.lastName}`}
                            </p>
                            <Divider type="vertical" style={{ margin: '0 8px' }} />
                            <p style={{ flex: '7' }}>
                              Methodology:
                              {` ${
                                project.methodology.charAt(0).toUpperCase() +
                                project.methodology.slice(1).replace(/(.)([A-Z])/g, '$1 $2')
                              }`}
                            </p>
                            <Divider
                              type="vertical"
                              style={{
                                margin: '0 8px',
                                color: { COMPANY_BLUE_COLOR },
                                fontWeight: 'bold',
                              }}
                            />
                            <p style={{ flex: '7' }}>
                              Status:{' '}
                              {project.status?.charAt(0).toUpperCase() +
                                project.status?.slice(1).replace(/(.)([A-Z])/g, '$1 $2')}
                            </p>
                          </div>
                        </Card>
                      </Badge.Ribbon>
                      <Divider type="horizontal"></Divider>
                      <Row gutter={[16, 16]} className="mb-10 pl-10">
                        {!isFromGuest && (
                          <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                            <div className="border border-gray-300 rounded-md p-4 bg-white">
                              <Statistic
                                title="Budget"
                                value={project.totalBudget}
                                valueStyle={{
                                  color: COMPANY_BLUE_COLOR,
                                }}
                                prefix={<DollarCircleOutlined style={{ fontSize: '100%' }} />}
                              />
                            </div>
                          </Col>
                        )}
                        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                          <div className="border border-gray-300 rounded-md p-4 bg-white">
                            <Statistic
                              title="Deliverables"
                              value={project.deliverablesCount}
                              valueStyle={{
                                color: COMPANY_BLUE_COLOR,
                              }}
                              prefix={<BranchesOutlined />}
                            />
                          </div>
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                          <div className="border border-gray-300 rounded-md p-4 bg-white">
                            <Statistic
                              title="Tasks"
                              value={project.taskCount}
                              valueStyle={{
                                color: COMPANY_BLUE_COLOR,
                              }}
                              prefix={<OrderedListOutlined />}
                            />
                          </div>
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                          <div className="border border-gray-300 rounded-md p-4 bg-white">
                            <Statistic
                              title="Members"
                              value={project.teamMemberCount}
                              valueStyle={{
                                color: COMPANY_BLUE_COLOR,
                              }}
                              prefix={<UserSwitchOutlined />}
                            />
                          </div>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </div>
              </div>
            ))}
      </Carousel>
    </Skeleton>
  );
};

export default ProjectCarousel;
