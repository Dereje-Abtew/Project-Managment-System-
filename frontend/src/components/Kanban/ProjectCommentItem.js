import React from 'react';
import { List, Avatar, Popconfirm, Tooltip } from 'antd';
import { DeleteOutlined, UserOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import { makeApiRequest } from '@/components/Kanban/request/apiRequest';
import { COMPANY_DANGER_COLOR } from '@/constants/companyConstants';

const ProjectCommentItem = ({ comment, projectId, onCommentDeleted }) => {
  const currentUser = useSelector(selectAuth);

  const canDelete =
    currentUser &&
    comment.postedBy &&
    (comment.postedBy._id === currentUser.id);

  const handleDelete = async () => {
    const res = await makeApiRequest(
      'delete',
      `project/${projectId}/comment/${comment._id}`,
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

export default ProjectCommentItem;