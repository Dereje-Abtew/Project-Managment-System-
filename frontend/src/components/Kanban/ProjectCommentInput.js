import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { makeApiRequest } from '@/components/Kanban/request/apiRequest';

const { TextArea } = Input;

const ProjectCommentInput = ({ projectId, onCommentAdded }) => {
  const [messageValue, setMessageValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!messageValue.trim()) {
      message.warning('Please enter a comment.');
      return;
    }
    setSubmitting(true);
    const res = await makeApiRequest(
      'post',
      `project/${projectId}/comment`,
      { message: messageValue.trim() },
      'Comment added successfully',
      'Failed to add comment'
    );
    setSubmitting(false);
    if (res && res.success) {
      setMessageValue('');
      if (onCommentAdded) {
        onCommentAdded(res.result);
      }
    }
  };

  return (
    <div className="p-0 d-flex" style={{ display: 'flex', gap: 8 }}>
      <TextArea
        rows={2}
        value={messageValue}
        onChange={(e) => setMessageValue(e.target.value)}
        placeholder="Type your message..."
        style={{ flex: 1 }}
      />
      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={handleSubmit}
        loading={submitting}
        disabled={!messageValue.trim()}
      >
        Send
      </Button>
    </div>
  );
};

export default ProjectCommentInput;