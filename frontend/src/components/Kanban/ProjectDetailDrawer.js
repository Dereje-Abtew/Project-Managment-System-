import {
  InfoCircleOutlined,
  InfoCircleTwoTone,
  UserOutlined,
  OrderedListOutlined,
  UserSwitchOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import { Drawer, Progress, List, Col, Row, Avatar, Popover, Card, Divider, Empty } from 'antd';
import React, { useState, useEffect } from 'react';
import moment from 'moment';

import CollapsablePanel from '../Collapse/Index';
import Timelines from '@/components/Timelines';
import capitalizeFirstLetter from '@/utils/stringHelpers';
import SecondaryAlert from '../SecondaryAlert/Index';
import { getTwoColors } from '@/utils/helpers';
import { COMPANY_BLUE_COLOR } from '@/constants/companyConstants';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import ProjectCommentInput from './ProjectCommentInput';
import ProjectCommentItem from './ProjectCommentItem';
const DescriptionItem = (value) => (
  <div className="site-description-item-profile-wrapper">
    <p className="site-description-item-profile-p-label">{value.title}:</p>
    {value.content}
  </div>
);
function ProjectDetailDrawer({
  project,
  isProjectDrawerVisible,
  setProjectDrawerVisible,
  deliverables,
  tasks,
}) {
  const [memberDrawer, setMemberDrawer] = useState(false);
  const [comments, setComments] = useState([]);

  const [childrenDrawer, setChildrenDrawer] = useState(false);
  const [activityDrawer, setActivityDrawer] = useState(false);

  // Sync comments from project prop
  useEffect(() => {
    if (project && project.comments) {
      setComments(project.comments);
    }
  }, [project]);

  const handleCommentAdded = (newComment) => {
    setComments((prev) => [...prev, newComment]);
  };

  const handleCommentDeleted = (commentId) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

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
      <List itemLayout="horizontal">
        <List.Item
          className="link-item-clickable"
          style={{ paddingLeft: '15px' }}
          onClick={() => {
            setChildrenDrawer(true);
          }}
        >
          <List.Item.Meta
            avatar={<InfoCircleOutlined style={{ fontSize: '140%' }} />}
            title="Project Deliverables"
            description={project.title}
          />
        </List.Item>
        <List.Item
          className="link-item-clickable"
          style={{ paddingLeft: '15px' }}
          onClick={() => {
            setMemberDrawer(true);
          }}
        >
          <List.Item.Meta
            avatar={<UserSwitchOutlined style={{ fontSize: '140%' }} />}
            title="Project Members"
            description={project.title}
          />
        </List.Item>

        <List.Item
          className="link-item-clickable"
          style={{ paddingLeft: '15px' }}
          onClick={() => {
            setActivityDrawer(true);
          }}
        >
          <List.Item.Meta
            avatar={<OrderedListOutlined style={{ fontSize: '140%' }} />}
            title="Project Tasks"
            description={project.title}
          />
        </List.Item>
      </List>
      <Drawer
        width={window.innerWidth > 900 ? window.innerWidth / 2 : window.innerWidth - 100}
        title="Project Deliverables"
        placement="right"
        closable={true}
        closeIcon={<RollbackOutlined />}
        visible={childrenDrawer}
        onClose={() => {
          setChildrenDrawer(false);
        }}
      >
        <p className="site-description-item-profile-p" style={{ marginBottom: 10 }}>
          <UserOutlined /> Project Leaders
        </p>

        <List itemLayout="horizontal">
          {[
            project.director && { person: project.director, role: 'Director' },
            project.projectManager && { person: project.projectManager, role: 'Project Manager' },
            project.teamLeader && { person: project.teamLeader, role: 'Team Leader' },
          ]
            .filter(Boolean)
            .map(({ person, role }, i) => (
              <List.Item key={i}>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} size="medium" />}
                  title={`${person.firstName || ''} ${person.lastName || ''} — ${role}`}
                  description={`${person.jobTitle || ''} · ${person.email || ''}`}
                />
              </List.Item>
            ))}
        </List>
        <div className="mt-3 mb-3">
          <SecondaryAlert message="Project Deliverables are listed below." />
        </div>
        <CollapsablePanel items={deliverables} />
      </Drawer>
      <Drawer
        width={window.innerWidth > 900 ? window.innerWidth / 2 : window.innerWidth - 100}
        title="Members"
        placement="right"
        closable={true}
        closeIcon={<RollbackOutlined />}
        visible={memberDrawer}
        onClose={() => {
          setMemberDrawer(false);
        }}
      >
        <SecondaryAlert message="Project Members are listed below." />
        <Divider dashed />

        <List itemLayout="horizontal">
          {/* Leaders row */}
          {[
            project.director && { person: project.director, role: 'Director' },
            project.projectManager && { person: project.projectManager, role: 'Project Manager' },
            project.teamLeader && { person: project.teamLeader, role: 'Team Leader' },
          ]
            .filter(Boolean)
            .map(({ person, role }, i) => (
              <List.Item key={`leader-${i}`}>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} size="medium" />}
                  title={
                    <Row>
                      <Col span={16}>
                        <Popover
                          placement="bottomLeft"
                          title="About Leader"
                          content={
                            <Card bordered={false} style={{ width: 280 }}
                              actions={[<InfoCircleTwoTone twoToneColor={COMPANY_BLUE_COLOR} key="info" />]}
                            >
                              <Card.Meta
                                avatar={<Avatar icon={<UserOutlined />} />}
                                title={`${person.firstName} ${person.lastName}`}
                                description={`@${person.jobTitle || ''}`}
                              />
                            </Card>
                          }
                        >
                          <span>{`${person.firstName} ${person.lastName}`}</span>
                        </Popover>
                      </Col>
                      <Col span={8}>{role}</Col>
                    </Row>
                  }
                  description={person.email}
                />
              </List.Item>
            ))}

          {/* Team members */}
          {project.teamMember &&
            project.teamMember.map((member, index) => (
              <List.Item key={`member-${index}`}>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} size="medium" />}
                  title={
                    <Row>
                      <Col span={16}>
                        <Popover
                          placement="bottomLeft"
                          title="About Member"
                          content={
                            <Card bordered={false} style={{ width: 280 }}
                              actions={[<InfoCircleTwoTone twoToneColor={COMPANY_BLUE_COLOR} key="info" />]}
                            >
                              <Card.Meta
                                avatar={<Avatar icon={<UserOutlined />} />}
                                title={`${member.firstName} ${member.lastName}`}
                                description={`@${member.jobTitle || ''}`}
                              />
                            </Card>
                          }
                        >
                          <span>{`${member.firstName} ${member.lastName}`}</span>
                        </Popover>
                      </Col>
                      <Col span={8}>Member</Col>
                    </Row>
                  }
                  description={member.email}
                />
              </List.Item>
            ))}
        </List>
      </Drawer>
      <Drawer
        width={window.innerWidth > 900 ? window.innerWidth / 2 : window.innerWidth - 100}
        title="Project Tasks"
        placement="right"
        closable={true}
        closeIcon={<RollbackOutlined />}
        visible={activityDrawer}
        onClose={() => {
          setActivityDrawer(false);
        }}
      >
        <SecondaryAlert message="Project activities are listed bellow." />
        <Divider dashed />
        <Timelines items={tasks} />
      </Drawer>
      <div className="mb-3 mt-3">
        <SecondaryAlert message="More Info" />
      </div>

      <Row className="mb-3">
        <Col span={12}>
          <DescriptionItem
            title="Category"
            content={<b>{project.category === undefined ? '' : project.category.categoryName}</b>}
          />
        </Col>
        <Col span={12}>
          <DescriptionItem title="Description" content={<b>{project.description}</b>} />
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

      {/* ── Project Comments Section ───────────────────────────────────── */}
      <Divider dashed />
      <div className="mb-3 mt-3">
        <SecondaryAlert message="Comments" />
      </div>

      {/* Comment input */}
      <ProjectCommentInput projectId={project._id} onCommentAdded={handleCommentAdded} />

      {/* Existing comments list */}
      <div style={{ marginTop: 16 }}>
        {comments && comments.length > 0 ? (
          comments
            .slice()
            .reverse()
            .map((comment) => (
              <ProjectCommentItem
                key={comment._id}
                comment={comment}
                projectId={project._id}
                onCommentDeleted={handleCommentDeleted}
              />
            ))
        ) : (
          <Empty description="No comments yet. Be the first to comment!" />
        )}
      </div>
    </Drawer>
  );
}

export default ProjectDetailDrawer;