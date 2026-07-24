import { RollbackOutlined } from '@ant-design/icons';
import { Col, Divider, Drawer, Progress, Row } from 'antd';
import moment from 'moment';

import { getTwoColors } from '@/utils/helpers';
import capitalizeFirstLetter from '@/utils/stringHelpers';
import SecondaryAlert from '../SecondaryAlert/Index';

const DescriptionItem = (value) => (
  <div className="site-description-item-profile-wrapper">
    <p className="site-description-item-profile-p-label">{value.title}:</p>
    {value.content}
  </div>
);
function ProjectDrawer({
  project,
  isProjectDrawerVisible,
  setProjectDrawerVisible,
  deliverables,
  tasks,
}) {
  if (!project) {
    return null;
  }

  return (
    <Drawer
      width={window.innerWidth > 900 ? window.innerWidth / 2 : window.innerWidth - 100}
      title={
        <>
          {project.title}
          <Progress percent={project.achievement} strokeColor={getTwoColors()} />
        </>
      }
      closable={true}
      visible={isProjectDrawerVisible}
      closeIcon={<RollbackOutlined />}
      onClose={() => {
        setProjectDrawerVisible(false);
      }}
    >
      <div className="mb-3 mt-3">
        <SecondaryAlert message="More Info" />
      </div>

      <Row className="mb-3">
        <Col span={12}>
          <DescriptionItem
            title="Category"
            content={<b>{project.categoryInfo && project.categoryInfo[0].categoryName}</b>}
          />
        </Col>
        <Col span={12}>
          <DescriptionItem
            title="Project Manager"
            content={
              <b>
                {project.teamLeaderInfo &&
                  `${project.teamLeaderInfo[0].firstName} ${project.teamLeaderInfo[0].lastName}`}
              </b>
            }
          />
        </Col>
        <Col span={12}>
          <DescriptionItem
            title="Team Leader"
            content={
              <b>
                {project.teamLeaderInfo &&
                  `${project.teamLeaderInfo[0].firstName} ${project.teamLeaderInfo[0].lastName}`}
              </b>
            }
          />
        </Col>
      </Row>
      <Row className="mb-3">
        <Col span={12}>
          <DescriptionItem
            title="Start Date"
            content={<b>{moment(project.startDate).format('MMMM Do YYYY, h:mm:ss a')}</b>}
          />
        </Col>
        <Col span={12}>
          <DescriptionItem
            title="End Date"
            content={<b>{moment(project.endDate).format('MMMM Do YYYY, h:mm:ss a')}</b>}
          />
        </Col>
      </Row>
      <Row className="mb-3">
        <Col span={12}>
          <DescriptionItem
            title="Methodology"
            content={<b>{capitalizeFirstLetter(project.methodology)}</b>}
          />
        </Col>
        <Col span={12}>
          <DescriptionItem
            title="Project Number"
            content={<b>{<b>{project.projectNumber}</b>}</b>}
          />
        </Col>
      </Row>
      <Divider dashed />
      <Row className="mb-3">
        <Col span={12}>
          <DescriptionItem title="Achievement" content={<b>{project.achievement}</b>} />
        </Col>
        <Col span={12}>
          <DescriptionItem title="Total Budget" content={<b>{project.totalBudget}</b>} />
        </Col>
      </Row>
      <Row className="mb-3">
        <Col span={12}>
          <DescriptionItem title="Owner Name" content={<b>{project.ownerName}</b>} />
        </Col>
        <Col span={12}>
          <DescriptionItem title="Owner Contact" content={<b>{project.ownerContact}</b>} />
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <DescriptionItem
            title="Priority"
            content={<b>{capitalizeFirstLetter(project.priority)}</b>}
          />
        </Col>
        <Col span={12}>
          <DescriptionItem
            title="Status"
            content={<b>{capitalizeFirstLetter(project.status)}</b>}
          />
        </Col>
      </Row>
    </Drawer>
  );
}

export default ProjectDrawer;
