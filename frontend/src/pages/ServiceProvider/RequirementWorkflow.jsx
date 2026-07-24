import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Form, Input, Row, Select, Space, Table, Tag, Typography, Alert, message, Modal, Descriptions, Upload } from 'antd';
import request from '@/request/request';
import { GetPermissions } from '@/utils/permissionsUtils';
import cryptoHelper from '@/utils/crypto';
import { AUTH_LOCAL_STORAGE } from '@/constants/localStorageKeyConstants';

const { Title, Text } = Typography;

export default function RequirementWorkflow() {
  const [form] = Form.useForm();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingRecord, setRejectingRecord] = useState(null);
  const sendPermissions = GetPermissions('send requirement');
  const approvePermissions = GetPermissions('approve requirement');
  const canCreate = sendPermissions.includes('create');
  const canApprove = approvePermissions.includes('update');

  const loadRequirements = async () => {
    try {
      setLoading(true);
      const response = await request.list({ entity: 'serviceprovider-requirement' });
      setRequirements(Array.isArray(response?.result) ? response.result : []);
    } catch (error) {
      message.error('Unable to load requirements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequirements();
  }, []);

  // Read current user for senderName/email defaults
  const authRaw = window.localStorage.getItem(AUTH_LOCAL_STORAGE);
  let authUser = null;
  if (authRaw) {
    authUser = cryptoHelper.decrypt(authRaw) || (function(){ try { return JSON.parse(authRaw); } catch(e){return null;} })();
  }
  const defaultSenderName = authUser ? `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() : '';
  const defaultSenderEmail = authUser?.email || '';
  const defaultSenderPhone = authUser?.phone || '';

  const beforeUpload = (file) => {
    const isAllowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type) || ['.pdf', '.doc', '.docx'].some(ext => file.name.toLowerCase().endsWith(ext));
    if (!isAllowed) {
      message.error('Only PDF or Word documents are allowed.');
      return Upload.LIST_IGNORE;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setAttachments((prev) => [...prev, { name: file.name, url: dataUrl }]);
    };
    reader.readAsDataURL(file);
    // prevent default upload
    return Upload.LIST_IGNORE;
  };

  const handleRemoveAttachment = (name) => {
    setAttachments((prev) => prev.filter((a) => a.name !== name));
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      // attach uploaded files
      const payload = { ...values, attachments };
      const response = await request.create({ entity: 'serviceprovider-requirement', jsonData: payload });
      if (response?.success) {
        message.success('Requirement submitted successfully.');
        form.resetFields();
        setAttachments([]);
        loadRequirements();
      }
    } catch (error) {
      message.error('Unable to submit requirement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (record) => {
    try {
      const response = await request.patch({ entity: `serviceprovider-requirement/approve/${record._id}`, jsonData: {} });
      if (response?.success) {
        message.success('Requirement approved.');
        loadRequirements();
      }
    } catch (error) {
      message.error('Unable to approve requirement.');
    }
  };

  const viewDetails = async (record) => {
    try {
      const response = await request.read({ entity: 'serviceprovider-requirement', id: record._id });
      if (response?.success) {
        setSelectedRequirement(response.result);
        setDetailVisible(true);
      }
    } catch (e) {
      message.error('Unable to load details.');
    }
  };

  const openRejectModal = (record) => {
    setRejectingRecord(record);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const submitReject = async () => {
    if (!rejectReason || !rejectingRecord) return message.error('Please enter a reason for rejection.');
    try {
      const response = await request.patch({ entity: `serviceprovider-requirement/reject/${rejectingRecord._id}`, jsonData: { approvalNotes: rejectReason } });
      if (response?.success) {
        message.success('Requirement rejected.');
        setRejectModalVisible(false);
        loadRequirements();
      }
    } catch (e) {
      message.error('Unable to reject requirement.');
    }
  };

  const columns = useMemo(() => [
    {
      title: 'Sender',
      dataIndex: 'senderName',
      key: 'senderName',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => <Tag color={record.status === 'approved' ? 'green' : record.status === 'rejected' ? 'red' : 'orange'}>{record.status}</Tag>,
    },
    {
      title: 'Submitted At',
      key: 'submittedAt',
      render: (_, record) => new Date(record.submittedAt).toLocaleString(),
    },
    {
      title: 'Approved By',
      key: 'approvedBy',
      render: (_, record) => (record.approvedBy ? `${record.approvedBy.firstName || ''} ${record.approvedBy.lastName || ''}`.trim() : '—'),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => viewDetails(record)}>
            View
          </Button>
          {canApprove && record.status !== 'approved' && (
            <>
              <Button size="small" type="primary" onClick={() => handleApprove(record)}>
                Approve
              </Button>
              <Button size="small" danger onClick={() => openRejectModal(record)}>
                Reject
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ], [canApprove]);

  return (
    <Card>
      <Title level={4}>Send Requirement Workflow</Title>
      <Text type="secondary">Submit requirements, track sender identity, and approve them before tasks are created.</Text>
      {canCreate ? (
        <>
          <Alert style={{ marginTop: 16, marginBottom: 16 }} type="info" message="All submissions include sender identity, date, and approval status." />
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="senderName" label="Sender Name" rules={[{ required: true }]} initialValue={defaultSenderName}>
                    <Input readOnly />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Date" initialValue={new Date().toLocaleString()}>
                    <Input readOnly />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="senderEmail" label="Sender Email" rules={[{ required: true, type: 'email' }]} initialValue={defaultSenderEmail}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="senderPhone" label="Sender Phone" rules={[{ required: true }]} initialValue={defaultSenderPhone}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              {/* Service provider, title and description removed per request. */}

              <Form.Item label="Attachment (PDF/DOC/DOCX)" required>
                <Upload beforeUpload={beforeUpload} multiple={false} accept=".pdf,.doc,.docx">
                  <Button>Choose File</Button>
                </Upload>
                <div style={{ marginTop: 8 }}>
                  {attachments.map((a) => (
                    <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <a href={a.url} target="_blank" rel="noreferrer">{a.name}</a>
                      <Button size="small" onClick={() => handleRemoveAttachment(a.name)}>Remove</Button>
                    </div>
                  ))}
                </div>
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={submitting}>
                Submit Requirement
              </Button>
          </Form>
        </>
      ) : (
        <Alert style={{ marginTop: 16 }} type="warning" message="You do not have permission to submit requirements." />
      )}

      <Table style={{ marginTop: 24 }} dataSource={requirements} rowKey="_id" columns={columns} loading={loading} />

      <Modal visible={detailVisible} title="Requirement Details" onCancel={() => setDetailVisible(false)} footer={null} width={800}>
        {selectedRequirement ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Sender">{selectedRequirement.senderName} ({selectedRequirement.submittedByType})</Descriptions.Item>
            <Descriptions.Item label="Submitted At">{new Date(selectedRequirement.submittedAt).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Status">{selectedRequirement.status}</Descriptions.Item>
            <Descriptions.Item label="Approved By">{selectedRequirement.approvedBy ? `${selectedRequirement.approvedBy.firstName || ''} ${selectedRequirement.approvedBy.lastName || ''}`.trim() : '—'}</Descriptions.Item>
            <Descriptions.Item label="Approved At">{selectedRequirement.approvedAt ? new Date(selectedRequirement.approvedAt).toLocaleString() : '—'}</Descriptions.Item>
            <Descriptions.Item label="Approval Notes">{selectedRequirement.approvalNotes || '—'}</Descriptions.Item>
            <Descriptions.Item label="Rejected At">{selectedRequirement.rejectedAt ? new Date(selectedRequirement.rejectedAt).toLocaleString() : '—'}</Descriptions.Item>
            <Descriptions.Item label="Rejection Notes">{selectedRequirement.rejectionNotes || selectedRequirement.approvalNotes || '—'}</Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>
    </Card>
  );
}
