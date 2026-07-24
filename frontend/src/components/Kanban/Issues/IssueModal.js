import { Avatar, Col, Divider, List, Modal, Row } from 'antd';
import axios from 'axios';
import moment from 'moment';

import { ClockCircleOutlined, UserOutlined, WarningOutlined } from '@ant-design/icons';

import { API_BASE_URL } from '@/config/serverConfig';
axios.defaults.baseURL = API_BASE_URL;
const IssueModal = ({ open, onCancel, issue }) => {
  return (
    <Modal
      centered
      width="800px"
      className="modal-dialog-centered"
      visible={open}
      title="Issue details"
      okText="Ok"
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={onCancel}
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
                        issue.assignedTo === ''
                          ? 'No assigned'
                          : issue.assignedTo === undefined
                          ? 'Not assigned'
                          : `${issue.assignedTo.firstName} ${issue.assignedTo.lastName} `
                      }`}
                    </span>
                  </>
                }
                description={`${
                  issue.assignedTo === ''
                    ? 'This issue is not assigned yet.'
                    : issue.assignedTo === undefined
                    ? 'This issue is not assigned yet.'
                    : `${issue.assignedTo.jobTitle}`
                }`}
              />
            </List.Item>
          </Col>
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
                    <b>Registered by : </b>
                    <span>
                      {`${
                        issue.registeredBy === ''
                          ? 'No assigned'
                          : issue.registeredBy === undefined
                          ? 'Not assigned'
                          : `${issue.registeredBy.firstName} ${issue.registeredBy.lastName} `
                      }`}
                    </span>
                  </>
                }
                description={`${
                  issue.registeredBy === ''
                    ? 'This issue has no registered by yet.'
                    : issue.registeredBy === undefined
                    ? 'This issue has no registered by yet.'
                    : `${issue.registeredBy.jobTitle}`
                }`}
              />
            </List.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <List.Item>
              <List.Item.Meta
                avatar={<WarningOutlined style={{ fontSize: '150%' }} />}
                title={issue.title}
                description={
                  <>
                    <Divider dashed />
                    {issue.description}
                  </>
                }
              />
            </List.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <List.Item className="pl-4">
              <List.Item.Meta
                avatar={<ClockCircleOutlined style={{ fontSize: '150%' }} />}
                title="Start Date"
                description={moment(issue.startDate).format('MMMM Do YYYY, h:mm:ss a').toString()}
              />
            </List.Item>
          </Col>
          <Col span={12}>
            <List.Item className="pl-4">
              <List.Item.Meta
                avatar={<ClockCircleOutlined style={{ fontSize: '150%' }} />}
                title="End Date"
                description={moment(issue.endDate).format('MMMM Do YYYY, h:mm:ss a').toString()}
              />
            </List.Item>
          </Col>
        </Row>
      </List>
    </Modal>
  );
};

export default IssueModal;
