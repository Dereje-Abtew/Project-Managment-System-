import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import request from '@/request/request';
import { GetPermissions } from '@/utils/permissionsUtils';
import cryptoHelper from '@/utils/crypto';
import { AUTH_LOCAL_STORAGE } from '@/constants/localStorageKeyConstants';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_COLOR = {
  submitted:           'orange',
  approved:            'green',
  rejected:            'red',
  enhancement_pending: 'blue',
  implemented:         'purple',
};

const STATUS_ICON = {
  approved: <CheckCircleOutlined />,
  rejected: <CloseCircleOutlined />,
};

function statusTag(status) {
  return (
    <Tag
      color={STATUS_COLOR[status] || 'default'}
      icon={STATUS_ICON[status]}
      style={{ textTransform: 'capitalize', fontWeight: 500 }}
    >
      {(status || '').replace(/_/g, ' ')}
    </Tag>
  );
}

function fullName(user) {
  if (!user) return '—';
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || '—';
}

function getAuthUser() {
  const raw = window.localStorage.getItem(AUTH_LOCAL_STORAGE);
  if (!raw) return null;
  try { return cryptoHelper.decrypt(raw) || JSON.parse(raw); } catch { return null; }
}

function downloadFile(attachment) {
  try {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.click();
  } catch { message.error('Could not download the file.'); }
}

function fileColor(name) {
  return (name || '').toLowerCase().endsWith('.pdf') ? '#e53935' : '#1565c0';
}

function AttachmentList({ attachments }) {
  if (!Array.isArray(attachments) || attachments.length === 0)
    return <Text type="secondary">—</Text>;

  // Group: originals first, then each enhancement file in order
  const originals    = attachments.filter((a) => !a.type || a.type === 'original');
  const enhancements = attachments.filter((a) => a.type === 'enhancement');

  const renderFile = (a, index) => (
    <div
      key={`${a.name}-${index}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '6px 12px', background: '#fff',
        borderRadius: 6, border: '1px solid #dde4f0', marginBottom: 4,
      }}
    >
      <FileOutlined style={{ color: fileColor(a.name), fontSize: 15 }} />
      <a
        href={a.url}
        target="_blank"
        rel="noreferrer"
        style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1a5c38' }}
      >
        {a.name}
      </a>
      <Tooltip title="Download">
        <Button type="link" size="small" icon={<DownloadOutlined />}
          onClick={() => downloadFile(a)} style={{ padding: 0, color: '#1a5c38' }} />
      </Tooltip>
    </div>
  );

  return (
    <div style={{ width: '100%' }}>
      {/* ── Original files ───────────────────────────────────────── */}
      {originals.length > 0 && (
        <div style={{ marginBottom: enhancements.length ? 8 : 0 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#e6f4ff', border: '1px solid #91caff',
            borderRadius: 4, padding: '2px 10px', marginBottom: 6,
          }}>
            <FileOutlined style={{ color: '#1677ff', fontSize: 12 }} />
            <Text style={{ fontSize: 11, fontWeight: 700, color: '#1677ff', textTransform: 'uppercase', letterSpacing: 1 }}>
              Original Document{originals.length > 1 ? 's' : ''}
            </Text>
          </div>
          {originals.map(renderFile)}
        </div>
      )}

      {/* ── Enhancement files — one section per file ─────────────── */}
      {enhancements.map((a, i) => (
        <div key={`enh-${i}`} style={{ marginTop: 8 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#f6ffed', border: '1px solid #b7eb8f',
            borderRadius: 4, padding: '2px 10px', marginBottom: 6,
          }}>
            <FileOutlined style={{ color: '#52c41a', fontSize: 12 }} />
            <Text style={{ fontSize: 11, fontWeight: 700, color: '#52c41a', textTransform: 'uppercase', letterSpacing: 1 }}>
              Enhancement {enhancements.length > 1 ? `#${i + 1}` : 'Document'}
            </Text>
          </div>
          {renderFile(a, i)}
        </div>
      ))}
    </div>
  );
}

// Inline file picker row used in forms
function FilePicker({ attachments, setAttachments }) {
  const beforeUpload = (file) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    if (!allowed.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      message.error(`"${file.name}" is not allowed. Only PDF or Word files.`);
      return Upload.LIST_IGNORE;
    }
    const reader = new FileReader();
    reader.onload = (e) =>
      setAttachments((prev) => [...prev, { name: file.name, url: e.target.result }]);
    reader.readAsDataURL(file);
    return Upload.LIST_IGNORE;
  };

  return (
    <>
      <Upload beforeUpload={beforeUpload} showUploadList={false} accept=".pdf,.doc,.docx">
        <Button icon={<UploadOutlined />}>Choose File</Button>
      </Upload>
      {attachments.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {attachments.map((a) => (
            <div
              key={a.name}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6,
                padding: '5px 12px', background: '#f8faff',
                borderRadius: 6, border: '1px solid #dde4f0',
              }}
            >
              <FileOutlined style={{ color: fileColor(a.name), fontSize: 15 }} />
              <a href={a.url} target="_blank" rel="noreferrer" style={{ flex: 1, color: '#1a5c38' }}>
                {a.name}
              </a>
              <Tooltip title="Download"><Button type="link" size="small" icon={<DownloadOutlined />}
                onClick={() => downloadFile(a)} style={{ padding: 0, color: '#1a5c38' }} /></Tooltip>
              <Button type="link" size="small" danger
                onClick={() => setAttachments((p) => p.filter((x) => x.name !== a.name))}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function SendRequirement() {
  const [form]    = Form.useForm();
  const [enhForm] = Form.useForm();

  const sendPermissions = GetPermissions('send requirement');
  const canCreate = sendPermissions.includes('create');

  const authUser     = getAuthUser();
  const defaultName  = authUser ? `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() : '';
  const defaultEmail = authUser?.email  || '';
  const defaultPhone = authUser?.phone  || '';

  const [requirements,   setRequirements]   = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [attachments,    setAttachments]    = useState([]);
  const [detailVisible,  setDetailVisible]  = useState(false);
  const [selected,       setSelected]       = useState(null);
  const [detailLoading,  setDetailLoading]  = useState(false);
  const [enhVisible,     setEnhVisible]     = useState(false);
  const [enhTarget,      setEnhTarget]      = useState(null);
  const [enhAttachments, setEnhAttachments] = useState([]);
  const [enhSubmitting,  setEnhSubmitting]  = useState(false);

  // ── load ───────────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const res = await request.get({ entity: 'serviceprovider-requirement/mine' });
      setRequirements(Array.isArray(res?.result) ? res.result : []);
    } catch { message.error('Unable to load your submissions.');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  // ── submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (values) => {
    if (attachments.length === 0) {
      message.warning('Please attach at least one file before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await request.create({
        entity: 'serviceprovider-requirement',
        jsonData: { ...values, attachments },
      });
      if (res?.success) {
        message.success('Requirement submitted successfully.');
        form.resetFields();
        setAttachments([]);
        load();
      }
    } catch { message.error('Submission failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  // ── view detail ────────────────────────────────────────────────────────────
  const viewDetail = async (record) => {
    setDetailLoading(true);
    setDetailVisible(true);
    setSelected(null);
    try {
      const res = await request.read({ entity: 'serviceprovider-requirement', id: record._id });
      if (res?.success) setSelected(res.result);
      else message.error('Unable to load details.');
    } catch { message.error('Unable to load details.');
    } finally { setDetailLoading(false); }
  };

  // ── enhancement ────────────────────────────────────────────────────────────
  const openEnhancement = async (record) => {
    // Always fetch the latest record so we show up-to-date attachments and history
    try {
      const res = await request.read({ entity: 'serviceprovider-requirement', id: record._id });
      setEnhTarget(res?.success ? res.result : record);
    } catch {
      setEnhTarget(record);
    }
    setEnhAttachments([]);
    enhForm.resetFields();
    setEnhVisible(true);
  };

  const submitEnhancement = async () => {
    let values;
    try { values = await enhForm.validateFields(); } catch { return; }
    setEnhSubmitting(true);
    try {
      const res = await request.post({
        entity: `serviceprovider-requirement/enhancement/${enhTarget._id}`,
        jsonData: {
          description: values.description,
          senderName:  defaultName,
          senderEmail: defaultEmail,
          senderPhone: defaultPhone,
          attachments: enhAttachments,  // new files only; backend appends to existing
        },
      });
      if (res?.success) {
        message.success('Enhancement submitted. Awaiting approver review.');
        setEnhVisible(false);
        load();
      }
    } catch { message.error('Enhancement submission failed. Please try again.');
    } finally { setEnhSubmitting(false); }
  };

  // ── columns ────────────────────────────────────────────────────────────────
  const columns = [
    {
      title: <b>#</b>,
      key: 'serial',
      width: 56,
      align: 'center',
      render: (_, __, idx) => <Text type="secondary">{idx + 1}</Text>,
    },
    {
      title: <b>Sender</b>,
      dataIndex: 'senderName',
      key: 'senderName',
    },
    {
      title: <b>Status</b>,
      key: 'status',
      width: 180,
      render: (_, r) => statusTag(r.status),
    },
    {
      title: <b>Submitted At</b>,
      key: 'submittedAt',
      width: 180,
      render: (_, r) => new Date(r.submittedAt).toLocaleString(),
    },
    {
      title: <b>Approved By</b>,
      key: 'approvedBy',
      width: 150,
      render: (_, r) => fullName(r.approvedBy),
    },
    {
      title: <b>Action</b>,
      key: 'action',
      width: 148,
      render: (_, r) => {
        const options = [
          { value: 'view', label: '👁  View Detail' },
          ...(r.status === 'rejected'
            ? [{ value: 'enhance', label: '✏️  Add Enhancement' }]
            : []),
        ];
        return (
          <Select
            placeholder="Select action"
            size="small"
            style={{ width: 148 }}
            value={null}
            onChange={(val) => {
              if (val === 'view')    viewDetail(r);
              if (val === 'enhance') openEnhancement(r);
            }}
            options={options}
          />
        );
      },
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ paddingBottom: 40 }}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16, padding: '16px 20px',
        background: '#fff', borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Send Requirement</Title>
          <Text type="secondary">Attach a PDF or Word document and submit it for approval.</Text>
        </div>
      </div>

      {/* ── Submit Form ───────────────────────────────────────────────────── */}
      {canCreate ? (
        <Card
          style={{ marginBottom: 24, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
          bodyStyle={{ padding: '20px 24px' }}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Sender Name" name="senderName" initialValue={defaultName} rules={[{ required: true }]}>
                  <Input readOnly style={{ background: '#f5f5f5', cursor: 'default' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Date">
                  <Input readOnly value={new Date().toLocaleDateString()}
                    style={{ background: '#f5f5f5', cursor: 'default' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Sender Email" name="senderEmail" initialValue={defaultEmail}
                  rules={[{ required: true, type: 'email' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Sender Phone" name="senderPhone" initialValue={defaultPhone}
                  rules={[{ required: true, message: 'Phone is required.' }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label={
                <span>
                  <span style={{ color: '#ff4d4f' }}>* </span>
                  Attachment <Text type="secondary">(PDF / DOC / DOCX)</Text>
                </span>
              }
            >
              <FilePicker attachments={attachments} setAttachments={setAttachments} />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                style={{ backgroundColor: '#1a5c38', borderColor: '#1a5c38', minWidth: 180 }}
              >
                Submit Requirement
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ) : (
        <Alert style={{ marginBottom: 20 }} type="warning" showIcon
          message="You do not have permission to submit requirements." />
      )}

      {/* ── My Submissions Table ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Title level={5} style={{ margin: 0 }}>My Submissions</Title>
        <Button size="small" icon={<ReloadOutlined />} onClick={load} loading={loading}>
          Refresh
        </Button>
      </div>

      <Card
        bodyStyle={{ padding: 0 }}
        style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}
      >
        <Table
          dataSource={requirements}
          rowKey="_id"
          columns={columns}
          loading={loading}
          size="middle"
          scroll={{ x: 800 }}
          rowClassName={(_, idx) => idx % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total, range) => `${range[0]}–${range[1]} of ${total} entries`,
            position: ['bottomCenter'],
          }}
          locale={{ emptyText: 'No requirements submitted yet.' }}
        />
      </Card>

      {/* ── Detail Modal ─────────────────────────────────────────────────── */}
      <Modal
        visible={detailVisible}
        title={<Space><EyeOutlined style={{ color: '#1a5c38' }} /><b>Requirement Details</b></Space>}
        onCancel={() => { setDetailVisible(false); setSelected(null); }}
        footer={<Button onClick={() => { setDetailVisible(false); setSelected(null); }}>Close</Button>}
        width={700}
        destroyOnClose
      >
        {detailLoading && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Text type="secondary">Loading details…</Text>
          </div>
        )}
        {!detailLoading && selected && (
          <Descriptions bordered column={1} size="small"
            labelStyle={{ width: 160, fontWeight: 500, background: '#f8faff' }}>
            <Descriptions.Item label="Sender">{selected.senderName}</Descriptions.Item>
            <Descriptions.Item label="Email">{selected.senderEmail || '—'}</Descriptions.Item>
            <Descriptions.Item label="Phone">{selected.senderPhone || '—'}</Descriptions.Item>
            <Descriptions.Item label="Submitted At">
              {new Date(selected.submittedAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Status">{statusTag(selected.status)}</Descriptions.Item>
            <Descriptions.Item label="Attachments">
              <AttachmentList attachments={selected.attachments} />
            </Descriptions.Item>
            {selected.approvedBy && (
              <>
                <Descriptions.Item label="Approved By">{fullName(selected.approvedBy)}</Descriptions.Item>
                <Descriptions.Item label="Approved At">
                  {selected.approvedAt ? new Date(selected.approvedAt).toLocaleString() : '—'}
                </Descriptions.Item>
                {selected.approvalNotes && (
                  <Descriptions.Item label="Approval Notes">{selected.approvalNotes}</Descriptions.Item>
                )}
              </>
            )}
            {selected.status === 'rejected' && (
              <>
                <Descriptions.Item label="Rejected By">{fullName(selected.rejectedBy)}</Descriptions.Item>
                <Descriptions.Item label="Rejected At">
                  {selected.rejectedAt ? new Date(selected.rejectedAt).toLocaleString() : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Rejection Reason">
                  <Text type="danger">{selected.rejectionReason || '—'}</Text>
                </Descriptions.Item>
              </>
            )}
            {selected.isEnhancement && Array.isArray(selected.enhancementHistory) && selected.enhancementHistory.length > 0 && (
              <Descriptions.Item label="Enhancement History">
                <div style={{ width: '100%' }}>
                  {selected.enhancementHistory.map((h) => (
                    <div
                      key={h.round}
                      style={{
                        marginBottom: 10, padding: '8px 12px',
                        background: '#f6ffed', borderRadius: 6,
                        border: '1px solid #b7eb8f',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text strong style={{ color: '#52c41a' }}>Round #{h.round}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {h.submittedAt ? new Date(h.submittedAt).toLocaleString() : ''}
                        </Text>
                      </div>
                      <Text>{h.description || '—'}</Text>
                    </div>
                  ))}
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* ── Enhancement Modal ────────────────────────────────────────────── */}
      <Modal
        visible={enhVisible}
        title={<Space><PlusCircleOutlined style={{ color: '#1a5c38' }} /><b>Submit Enhancement</b></Space>}
        onCancel={() => setEnhVisible(false)}
        onOk={submitEnhancement}
        okText="Submit Enhancement"
        confirmLoading={enhSubmitting}
        okButtonProps={{ style: { backgroundColor: '#1a5c38', borderColor: '#1a5c38' } }}
        width={580}
        destroyOnClose
      >
        {/* ── Original attachment — read-only ───────────────────────────── */}
        <div style={{
          background: '#e6f4ff', border: '1px solid #91caff',
          borderRadius: 8, padding: '12px 16px', marginBottom: 4,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <FileOutlined style={{ color: '#1677ff' }} />
            <Text strong style={{ color: '#1677ff', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
              Original Document{enhTarget?.attachments?.filter(a => !a.type || a.type === 'original').length > 1 ? 's' : ''}
            </Text>
          </div>
          {enhTarget && Array.isArray(enhTarget.attachments) &&
           enhTarget.attachments.filter(a => !a.type || a.type === 'original').length > 0 ? (
            enhTarget.attachments
              .filter((a) => !a.type || a.type === 'original')
              .map((a, i) => (
                <div
                  key={`orig-${i}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '5px 10px', background: '#fff',
                    borderRadius: 6, border: '1px solid #91caff', marginBottom: 4,
                  }}
                >
                  <FileOutlined style={{ color: fileColor(a.name), fontSize: 15 }} />
                  <a href={a.url} target="_blank" rel="noreferrer"
                    style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1a5c38' }}>
                    {a.name}
                  </a>
                  <Tooltip title="Download">
                    <Button type="link" size="small" icon={<DownloadOutlined />}
                      onClick={() => downloadFile(a)} style={{ padding: 0, color: '#1677ff' }} />
                  </Tooltip>
                </div>
              ))
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>No original attachments on record.</Text>
          )}

          {/* Show previous enhancement files if re-enhancing */}
          {enhTarget && Array.isArray(enhTarget.attachments) &&
           enhTarget.attachments.filter(a => a.type === 'enhancement').length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <FileOutlined style={{ color: '#52c41a' }} />
                <Text strong style={{ color: '#52c41a', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Previous Enhancement{enhTarget.attachments.filter(a => a.type === 'enhancement').length > 1 ? 's' : ''}
                </Text>
              </div>
              {enhTarget.attachments
                .filter(a => a.type === 'enhancement')
                .map((a, i) => (
                  <div
                    key={`prev-enh-${i}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '5px 10px', background: '#fff',
                      borderRadius: 6, border: '1px solid #b7eb8f', marginBottom: 4,
                    }}
                  >
                    <FileOutlined style={{ color: fileColor(a.name), fontSize: 15 }} />
                    <a href={a.url} target="_blank" rel="noreferrer"
                      style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1a5c38' }}>
                      {a.name}
                    </a>
                    <Tooltip title="Download">
                      <Button type="link" size="small" icon={<DownloadOutlined />}
                        onClick={() => downloadFile(a)} style={{ padding: 0, color: '#52c41a' }} />
                    </Tooltip>
                  </div>
                ))}
            </div>
          )}
        </div>

        <Divider style={{ margin: '16px 0', borderColor: '#d9d9d9' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Enhancement Details Below</Text>
        </Divider>

        {/* ── Enhancement form ──────────────────────────────────────────── */}
        <Form form={enhForm} layout="vertical">
          <Form.Item
            label="Enhancement Description"
            name="description"
            rules={[{ required: true, message: 'Please describe your enhancement.' }]}
          >
            <TextArea rows={4} placeholder="Explain what you changed or improved…"
              showCount maxLength={1000} />
          </Form.Item>

          <Form.Item
            label={
              <span>
                Enhancement Document
                <Text type="secondary" style={{ fontWeight: 400, marginLeft: 6 }}>
                  (PDF / DOC / DOCX — optional)
                </Text>
              </span>
            }
          >
            <div style={{
              background: '#f6ffed', border: '1px solid #b7eb8f',
              borderRadius: 8, padding: '12px 16px',
            }}>
              <FilePicker attachments={enhAttachments} setAttachments={setEnhAttachments} />
              {enhAttachments.length === 0 && (
                <Text type="secondary" style={{ fontSize: 12, marginTop: 6, display: 'block' }}>
                  Upload a new version of your document if the content has changed.
                </Text>
              )}
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Shared table styles ───────────────────────────────────────────── */}
      <style>{`
        .table-row-light td { background: #ffffff !important; }
        .table-row-dark  td { background: #f8faff !important; }
        .ant-table-thead > tr > th {
          background: #1a5c38 !important;
          color: #fff !important;
          font-weight: 600 !important;
          white-space: nowrap;
        }
        .ant-table-thead > tr > th .anticon { color: #fff !important; }
        .ant-pagination { margin-top: 16px !important; }
      `}</style>
    </div>
  );
}
