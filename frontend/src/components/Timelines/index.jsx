import React from 'react';
import { Timeline, Badge, Space, Row, Col } from 'antd';
import moment from 'moment';

import {
  RetweetOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  CheckCircleTwoTone,
  UserOutlined,
  DollarOutlined,
  PercentageOutlined,
  CommentOutlined,
  CheckCircleOutlined,
  CaretRightOutlined,
} from '@ant-design/icons';

import { Collapse, Avatar, List } from 'antd';
import {
  COMPANY_BLUE_COLOR,
  COMPANY_DANGER_COLOR,
  COMPANY_SECONDARY_COLOR,
  COMPANY_SUCCESS_COLOR,
  COMPANY_YELLOW_COLOR,
} from '@/constants/companyConstants';
import {
  ASSIGNED_LABEL,
  BACKLOG_LABEL,
  COMPLETED_LABEL,
  DONE_LABEL,
} from '@/constants/kanbanBoardCardLabels';
const { Panel } = Collapse;

function Timelines({ items }) {
  items.sort((a, b) => {
    return new Date(b.assignedDate) - new Date(a.assignedDate);
  });

  const updatedItems =
    items &&
    items.map((task) => ({
      ...task,
      dependOnTask: items.find((t) => t._id === task.dependOnTask)?.title || 'No task dependency',
    }));

  let currentDate = new Date();

  const genExtra = (item) => (
    <Space>
      <Badge
        style={{
          backgroundColor:
            new Date(item.submissionDate) < new Date() &&
            item.stage.toUpperCase() !== COMPLETED_LABEL.toUpperCase()
              ? COMPANY_DANGER_COLOR
              : item.stage.toUpperCase() === COMPLETED_LABEL.toUpperCase() ||
                item.stage.toUpperCase() === DONE_LABEL.toUpperCase()
              ? COMPANY_SUCCESS_COLOR
              : item.stage.toUpperCase() === BACKLOG_LABEL.toUpperCase()
              ? COMPANY_SECONDARY_COLOR
              : item.stage.toUpperCase() === ASSIGNED_LABEL.toUpperCase()
              ? COMPANY_YELLOW_COLOR
              : COMPANY_BLUE_COLOR,
          marginRight: (item.actual * 100) / item.weight > 99 ? '0px' : '12px',
          borderRadius: '5px',
        }}
        count={item.stage}
      />
      <Badge
        style={{
          backgroundColor:
            new Date(item.submissionDate) < new Date() &&
            item.stage.toUpperCase() !== COMPLETED_LABEL.toUpperCase()
              ? COMPANY_DANGER_COLOR
              : item.stage.toUpperCase() === COMPLETED_LABEL.toUpperCase() ||
                item.stage.toUpperCase() === DONE_LABEL.toUpperCase()
              ? COMPANY_SUCCESS_COLOR
              : item.stage.toUpperCase() === BACKLOG_LABEL.toUpperCase()
              ? COMPANY_SECONDARY_COLOR
              : item.stage.toUpperCase() === ASSIGNED_LABEL.toUpperCase()
              ? COMPANY_YELLOW_COLOR
              : COMPANY_BLUE_COLOR,
          borderRadius: '5px',
        }}
        count={item.weight + ' | ' + ((item.actual * 100) / item.weight).toFixed(2) + '%'}
      />
    </Space>
  );

  return (
    <Timeline>
      {updatedItems.map((item, index) => (
        <Timeline.Item
          dot={
            <CheckCircleTwoTone
              twoToneColor={
                new Date(item.submissionDate) < new Date() &&
                item.stage.toUpperCase() !== COMPLETED_LABEL.toUpperCase()
                  ? COMPANY_DANGER_COLOR
                  : item.stage.toUpperCase() === COMPLETED_LABEL.toUpperCase() ||
                    item.stage.toUpperCase() === DONE_LABEL.toUpperCase()
                  ? COMPANY_SUCCESS_COLOR
                  : item.stage.toUpperCase() === BACKLOG_LABEL.toUpperCase()
                  ? COMPANY_SECONDARY_COLOR
                  : item.stage.toUpperCase() === ASSIGNED_LABEL.toUpperCase()
                  ? COMPANY_YELLOW_COLOR
                  : COMPANY_BLUE_COLOR
              }
            />
          }
          key={index}
        >
          <Collapse
            style={{ padding: '0', marginTop: '-15px' }}
            className="link-item-clickable"
            ghost={true}
            bordered={false}
            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
          >
            <Panel
              header={
                <Space>
                  <span
                    style={{
                      color:
                        new Date(item.submissionDate).getTime() < currentDate.getTime() &&
                        item.stage.toUpperCase() !== COMPLETED_LABEL.toUpperCase()
                          ? COMPANY_DANGER_COLOR
                          : '',
                    }}
                  >
                    {item.title}
                  </span>
                </Space>
              }
              extra={genExtra(item)}
              key={index}
            >
              <List itemLayout="horizontal">
                <Row>
                  <Col span={12}>
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            icon={<UserOutlined />}
                            size="medium"
                            className="last"
                            style={{ float: 'left' }}
                          />
                        }
                        title={
                          <>
                            <b>Assigned to : </b>
                            <span>
                              {`${
                                item.assignedTo === ''
                                  ? 'No assigned'
                                  : item.assignedTo === undefined
                                  ? 'Not assigned'
                                  : `${item.assignedTo.firstName} ${item.assignedTo.lastName} `
                              }`}
                            </span>
                          </>
                        }
                        description={`${
                          item.assignedTo === ''
                            ? 'This task is not assigned yet.'
                            : item.assignedTo === undefined
                            ? 'This task is not assigned yet.'
                            : `${item.assignedTo.jobTitle}`
                        }`}
                      />
                    </List.Item>
                  </Col>
                  <Col span={12}>
                    <List.Item>
                      <List.Item.Meta
                        avatar={<CommentOutlined />}
                        title="Remark"
                        description={item.remark}
                      />
                    </List.Item>
                  </Col>
                </Row>

                <Row>
                  <Col span={24}>
                    <List.Item>
                      <List.Item.Meta
                        avatar={<InfoCircleOutlined />}
                        title={item.title}
                        description={item.description}
                      />
                    </List.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <List.Item className="pl-4">
                      <List.Item.Meta
                        avatar={<ClockCircleOutlined style={{ fontSize: '150%' }} />}
                        title="Assigned Date"
                        description={moment(item.assignedDate)
                          .format('MMMM Do YYYY, h:mm:ss a')
                          .toString()}
                      />
                    </List.Item>
                  </Col>
                  <Col span={12}>
                    <List.Item className="pl-4">
                      <List.Item.Meta
                        avatar={<ClockCircleOutlined style={{ fontSize: '150%' }} />}
                        title="Submission Date"
                        description={moment(item.submissionDate)
                          .format('MMMM Do YYYY, h:mm:ss a')
                          .toString()}
                      />
                    </List.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <List.Item className="pl-4">
                      <List.Item.Meta
                        avatar={<DollarOutlined style={{ fontSize: '150%' }} />}
                        title="Cost"
                        description={item.cost}
                      />
                    </List.Item>
                  </Col>
                  <Col span={12}>
                    <List.Item className="pl-4">
                      <List.Item.Meta
                        avatar={<DollarOutlined style={{ fontSize: '150%' }} />}
                        title="Actual Cost"
                        description={item.actualCost}
                      />
                    </List.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <List.Item className="pl-4">
                      <List.Item.Meta
                        avatar={<PercentageOutlined style={{ fontSize: '150%' }} />}
                        title="Weight"
                        description={item.weight}
                      />
                    </List.Item>
                  </Col>
                  <Col span={12}>
                    <List.Item className="pl-4">
                      <List.Item.Meta
                        avatar={<PercentageOutlined style={{ fontSize: '150%' }} />}
                        title="Performance"
                        description={item.actual}
                      />
                    </List.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <List.Item className="pl-4">
                      <List.Item.Meta
                        avatar={<RetweetOutlined style={{ fontSize: '150%' }} />}
                        title="Dependency"
                        description={item.dependOnTask}
                      />
                    </List.Item>
                  </Col>
                  <Col span={12}>
                    <List.Item className="pl-4">
                      <List.Item.Meta
                        avatar={<CheckCircleOutlined style={{ fontSize: '150%' }} />}
                        title="Assured By"
                        description={`${
                          item.assuredBy === ''
                            ? 'No assigned'
                            : item.assuredBy === undefined
                            ? 'Not assigned'
                            : `${item.assuredBy.firstName} ${item.assuredBy.lastName} `
                        }`}
                      />
                    </List.Item>
                  </Col>
                </Row>
              </List>
            </Panel>
          </Collapse>
        </Timeline.Item>
      ))}
    </Timeline>
  );
}

export default Timelines;
