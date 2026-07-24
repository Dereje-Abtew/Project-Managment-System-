import { Avatar, Col, Divider, List, Modal, Progress, Row, Empty, Input, Button, Popconfirm, Tooltip, message } from 'antd';
import axios from 'axios';
import moment from 'moment';
import React, { useState, useEffect } from 'react';

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CommentOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  PercentageOutlined,
  RetweetOutlined,
  UserOutlined,
  SendOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

import { API_BASE_URL } from '@/config/serverConfig';
import { getTwoColors } from '@/utils/helpers';
import { makeApiRequest } from '@/components/Kanban/request/apiRequest';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import { COMPANY_DANGER_COLOR } from '@/constants/companyConstants';

const { TextArea } = Input;

axios.defaults.baseURL = API_BASE_URL;

const TaskCommentItem = ({ comment, projectId, taskId, onCommentDeleted }) => {
  const currentUser = useSelector(selectAuth);

  const canDelete =
    currentUser &&
    comment.postedBy &&
    (comment.postedBy._id === currentUser.id);

  const handleDelete = async () => {
    const res = await makeApiRequest(
      'delete',
      `project/${projectId}/task/${taskId}/comment/${comment._id}`,
      null,
      'Comment deleted successfully',
      'Failed to delete comment'
    );
    if (res && res.success && onCommentDeleted) {
      onCommentDeleted(comment._id);
    }
  };

  const userName = comment.postedBy
    ? `${comment.postedBy.firstName || ''} ${comment.postedBy.lastName || ''}`.trim() ||
      comment.postedBy.email ||
      'Unknown User'
    : 'Unknown User';

  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <List.Item
      style={{ padding: '8px 0' }}
      actions={
        canDelete
          ? [
              <Popconfirm
                title="Are you sure you want to delete this comment?"
                onConfirm={handleDelete}
                okText="Yes"
                cancelText="No"
              >
                <Tooltip title="Delete comment">
                  <DeleteOutlined style={{ color: COMPANY_DANGER_COLOR, cursor: 'pointer' }} />
                </Tooltip>
              </Popconfirm>,
            ]
          : []
      }
    >
      <List.Item.Meta
        avatar={
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }}>
            {userInitial}
          </Avatar>
        }
        title={
          <span>
            {userName}
            <span style={{ marginLeft: 12, fontSize: 12, color: '#999' }}>
              {moment(comment.createdAt).fromNow()}
            </span>
          </span>
        }
        description={comment.message}
      />
    </List.Item>
  );
};

const TaskModal = ({ open, onCancel, currentTask, projectId }) => {
  const [comments, setComments] = useState([]);
  const [messageValue, setMessageValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync comments from currentTask
  useEffect(() => {
    if (currentTask && currentTask.comments) {
      setComments(currentTask.comments);
    } else {
      setComments([]);
    }
  }, [currentTask]);

  const handleAddComment = async () => {
    if (!messageValue.trim()) {
      message.warning('Please enter a comment.');
      return;
    }
    if (!projectId || !currentTask?._id) {
      message.error('Project or task ID missing.');
      return;
    }
    setSubmitting(true);
    const res = await makeApiRequest(
      'post',
      `project/${projectId}/task/${currentTask._id}/comment`,
      { message: messageValue.trim() },
      'Comment added successfully',
      'Failed to add comment'
    );
    setSubmitting(false);
    if (res && res.success) {
      setMessageValue('');
      setComments((prev) => [...prev, res.result]);
    }
  };

  const handleCommentDeleted = (commentId) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

  return (
    <Modal
      centered
      width="800px"
      className="modal-dialog-centered"
      visible={open}
      title="Task details"
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
                        currentTask.assignedTo === ''
                          ? 'No assigned'
                          : currentTask.assignedTo === undefined
                          ? 'Not assigned'
                          : `${currentTask.assignedTo.firstName} ${currentTask.assignedTo.lastName} `
                      }`}
                    </span>
                  </>
                }
                description={`${
                  currentTask.assignedTo === ''
                    ? 'This task is not assigned yet.'
                    : currentTask.assignedTo === undefined
                    ? 'This task is not assigned yet.'
                    : `${currentTask.assignedTo.jobTitle}`
                }`}
              />
            </List.Item>
          </Col>

          <Col span={12}>
            <List.Item>
              <List.Item.Meta
                avatar={<CommentOutlined style={{ fontSize: '150%' }} />}
                title="Remark"
                description={currentTask.remark}
              />
            </List.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <List.Item>
              <List.Item.Meta
                avatar={<InfoCircleOutlined style={{ fontSize: '150%' }} />}
                title={currentTask.title}
                description={
                  <>
                    <Divider dashed /> {currentTask.description}
                  </>
                }
              />
            </List.Item>
          </Col>
          <Divider dashed />
          <Col span={1}> </Col>

          <Col span={9}>
            <p>Weight Performance</p>
            <Progress
              percent={
                currentTask.actual === 0
                  ? 0
                  : ((currentTask.actual * 100) / currentTask.weight).toFixed(2)
              }
              strokeColor={getTwoColors()}
            />
          </Col>
          <Col span={3}> </Col>

          <Col span={9}>
            <p>Cost Performance</p>
            <Progress
              percent={
                currentTask.actualCost === 0
                  ? 0
                  : ((currentTask.actualCost * 100) / currentTask.cost).toFixed(2)
              }
              strokeColor={getTwoColors()}
            />
          </Col>
          <Col span={2}> </Col>

          <Divider dashed />
        </Row>
        <Row>
          <Col span={12}>
            <List.Item className="pl-4">
              <List.Item.Meta
                avatar={<ClockCircleOutlined style={{ fontSize: '150%' }} />}
                title="Assigned Date"
                description={moment(currentTask.assignedDate)
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
                description={moment(currentTask.submissionDate)
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
                description={currentTask.cost}
              />
            </List.Item>
          </Col>
          <Col span={12}>
            <List.Item className="pl-4">
              <List.Item.Meta
                avatar={<DollarOutlined style={{ fontSize: '150%' }} />}
                title="Actual Cost"
                description={currentTask.actualCost}
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
                description={currentTask.weight}
              />
            </List.Item>
          </Col>
          <Col span={12}>
            <List.Item className="pl-4">
              <List.Item.Meta
                avatar={<PercentageOutlined style={{ fontSize: '150%' }} />}
                title="Actual Weight"
                description={currentTask.actual}
              />
            </List.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <List.Item className="pl-4">
              <List.Item.Meta
                avatar={<RetweetOutlined style={{ fontSize: '150%' }} />}
                title="Task has dependency?"
                description={currentTask.dependOnTask ? 'Yes' : 'No'}
              />
            </List.Item>
          </Col>
          <Col span={12}>
            <List.Item className="pl-4">
              <List.Item.Meta
                avatar={<CheckCircleOutlined style={{ fontSize: '150%' }} />}
                title="Assured By"
                description={`${
                  currentTask.assuredBy === ''
                    ? 'No assigned'
                    : currentTask.assuredBy === undefined
                    ? 'Not assigned'
                    : `${currentTask.assuredBy.firstName} ${currentTask.assuredBy.lastName} `
                }`}
              />
            </List.Item>
          </Col>
        </Row>
      </List>

      {/* ── Task Comments Section ──────────────────────────────────────── */}
      <Divider dashed />
      <div style={{ marginTop: 16 }}>
        <h4 style={{ marginBottom: 12 }}>
          <CommentOutlined style={{ marginRight: 8 }} />
          Comments ({comments.length})
        </h4>

        {/* Comment input */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <TextArea
            rows={2}
            value={messageValue}
            onChange={(e) => setMessageValue(e.target.value)}
            placeholder="Type a comment..."
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleAddComment}
            loading={submitting}
            disabled={!messageValue.trim()}
          >
            Send
          </Button>
        </div>

        {/* Comments list */}
        {comments && comments.length > 0 ? (
          comments
            .slice()
            .reverse()
            .map((comment) => (
              <TaskCommentItem
                key={comment._id}
                comment={comment}
                projectId={projectId}
                taskId={currentTask._id}
                onCommentDeleted={handleCommentDeleted}
              />
            ))
        ) : (
          <Empty description="No comments yet." />
        )}
      </div>
    </Modal>
  );
};

export default TaskModal;