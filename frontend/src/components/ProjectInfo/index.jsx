import { Carousel, Divider, Steps, Typography } from 'antd';

import { COMPANY_BLUE_COLOR } from '@/constants/companyConstants';
import {
  DashboardTwoTone,
  FilePdfTwoTone,
  FundTwoTone,
  MessageTwoTone,
  PieChartTwoTone,
  ProfileTwoTone,
  ProjectTwoTone,
  ScheduleTwoTone,
} from '@ant-design/icons';

const { Title } = Typography;
const ProjectDescription = () => {
  const contentStyle = {
    height: '260px',
    color: COMPANY_BLUE_COLOR,
    lineHeight: '160px',
    textAlign: 'center',
  };
  return (
    <>
      <Title style={{ textAlign: 'center' }} level={3}>
        Project Management System
      </Title>
      <Divider dashed />
      <Carousel autoplay>
        <div>
          <div style={contentStyle}>
            <Steps direction="vertical" current={8}>
              <Steps.Step
                title="Methodology"
                icon={<ProjectTwoTone twoToneColor={COMPANY_BLUE_COLOR} />}
                description={
                  <p>
                    Our Project Management System supports both Waterfall and Agile methodologies,
                    providing the necessary features and flexibility to accommodate your preferred
                    approach.
                  </p>
                }
              />
            </Steps>
          </div>
        </div>
        <div>
          <div style={contentStyle}>
            <Steps direction="vertical" current={8}>
              <Steps.Step
                title="Project Dashboard"
                icon={<DashboardTwoTone twoToneColor={COMPANY_BLUE_COLOR} />}
                description={
                  <p>
                    Get an instant overview of all your ongoing projects, including key metrics,
                    timelines, and milestones. Stay informed about project progress at a glance.
                  </p>
                }
              />
            </Steps>
          </div>
        </div>
        <div>
          <h3 style={contentStyle}>
            <Steps direction="vertical" current={2}>
              <Steps.Step
                title="Task Management"
                icon={<ProfileTwoTone twoToneColor={COMPANY_BLUE_COLOR} />}
                description={
                  <p>
                    Create, assign, and track tasks within each project. Set priorities, due dates,
                    and dependencies to ensure smooth task execution and timely completion.
                  </p>
                }
              />
            </Steps>
          </h3>
        </div>
        <div>
          <h3 style={contentStyle}>
            <Steps direction="vertical" current={2}>
              <Steps.Step
                title="Team Collaboration"
                icon={<MessageTwoTone twoToneColor={COMPANY_BLUE_COLOR} />}
                description={
                  <p>
                    Foster effective collaboration among team members with real-time messaging, file
                    sharing, and discussion forums. Enhance communication and keep everyone aligned
                    towards project success.
                  </p>
                }
              />
            </Steps>
          </h3>
        </div>
        <div>
          <h3 style={contentStyle}>
            <Steps direction="vertical" current={2}>
              <Steps.Step
                title="Time Tracking"
                icon={<ScheduleTwoTone twoToneColor={COMPANY_BLUE_COLOR} />}
                description={
                  <p>
                    Monitor and log the time spent on different tasks and projects. Gain insights
                    into resource allocation, identify bottlenecks, and optimize project schedules.
                  </p>
                }
              />
            </Steps>
          </h3>
        </div>
        <div>
          <h3 style={contentStyle}>
            <Steps direction="vertical" current={2}>
              <Steps.Step
                title="Gantt Charts"
                icon={<PieChartTwoTone twoToneColor={COMPANY_BLUE_COLOR} />}
                description={
                  <p>
                    Visualize project timelines, dependencies, and critical paths using interactive
                    Gantt charts. Identify project milestones, allocate resources efficiently, and
                    manage project schedules effectively.
                  </p>
                }
              />
            </Steps>
          </h3>
        </div>
        <div>
          <h3 style={contentStyle}>
            <Steps direction="vertical" current={2}>
              <Steps.Step
                title="Reporting and Analytics"
                icon={<FilePdfTwoTone twoToneColor={COMPANY_BLUE_COLOR} />}
                description={
                  <p>
                    Generate comprehensive reports and analytics to track project performance,
                    monitor key metrics, and identify areas for improvement. Make data-driven
                    decisions to optimize your project management processes.
                  </p>
                }
              />
            </Steps>
          </h3>
        </div>
        <div>
          <h3 style={contentStyle}>
            <Steps direction="vertical" current={2}>
              <Steps.Step
                title="Performance Evaluation"
                icon={<FundTwoTone twoToneColor={COMPANY_BLUE_COLOR} />}
                description={
                  <p>
                    Our Project Management System includes performance evaluation based on cost and
                    weight factors, allowing you to assess project performance, optimize efficiency,
                    and achieve cost-effective outcomes.
                  </p>
                }
              />
            </Steps>
          </h3>
        </div>
      </Carousel>
    </>
  );
};

export default ProjectDescription;
