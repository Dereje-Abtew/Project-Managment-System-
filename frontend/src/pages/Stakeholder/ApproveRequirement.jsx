import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Divider,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileOutlined,
  FileTextOutlined,
  ReloadOutlined,
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
  approved:            <CheckCircleOutlined />,
  rejected:            <CloseCircleOutlined />,
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

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ApproveRequirement() {
  const approvePermissions = GetPermissions('approve requirement');
  const canApprove = approvePermissions.includes('update');

  const authUser     = getAuthUser();
  const approverName = authUser
    ? `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim()
    : '';

  const [requirements,    setRequirements]    = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [approvingId,     setApprovingId]     = useState(null);
  const [detailVisible,   setDetailVisible]   = useState(false);
  const [selected,        setSelected]        = useState(null);
  const [detailLoading,   setDetailLoading]   = useState(false);
  const [rejectVisible,   setRejectVisible]   = useState(false);
  const [rejectTarget,    setRejectTarget]    = useState(null);
  const [rejectSubmitting,setRejectSubmitting]= useState(false);
  const [rejectForm]   = Form.useForm();

  // reversal state
  const [reverseVisible,    setReverseVisible]    = useState(false);
  const [reverseTarget,     setReverseTarget]     = useState(null);
  const [reverseSubmitting, setReverseSubmitting] = useState(false);
  const [reverseForm]  = Form.useForm();

  // Templates indexed by stakeholder id — for the Template column
  const [templateMap, setTemplateMap] = useState({});

  // ── load ───────────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const res = await request.list({ entity: 'stakeholder-requirement' });
      setRequirements(Array.isArray(res?.result) ? res.result : []);
    } catch {
      message.error('Unable to load requirements.');
    } finally {
      setLoading(false);
    }
  };

  // ── load templates → build id→template map ─────────────────────────────────
  const loadTemplates = async () => {
    try {
      const res = await request.list({ entity: 'requirement-template' });
      if (Array.isArray(res?.result)) {
        const map = {};
        let globalTemplate = null;
        for (const t of res.result) {
          if (t.isGlobal) {
            if (!globalTemplate) globalTemplate = t;  // most recent global
          } else {
            const spId = t.stakeholder?._id || t.stakeholder;
            if (spId && !map[spId]) map[spId] = t;    // specific wins
          }
        }
        // Global template stored under sentinel — fallback for any provider
        if (globalTemplate) map['__global__'] = globalTemplate;
        setTemplateMap(map);
      }
    } catch { /* non-fatal */ }
  };

  useEffect(() => { load(); loadTemplates(); }, []);

  // ── approve ────────────────────────────────────────────────────────────────
  const handleApprove = async (record) => {
    setApprovingId(record._id);
    try {
      const res = await request.patch({
        entity: `stakeholder-requirement/approve/${record._id}`,
        jsonData: {},
      });
      if (res?.success) {
        message.success(`Approved — ${record.senderName}`);
        setRequirements((prev) =>
          prev.map((r) =>
            r._id === record._id
              ? { ...r, status: 'approved', approvedBy: authUser, approvedAt: new Date().toISOString() }
              : r
          )
        );
      }
    } catch { message.error('Approval failed. Please try again.');
    } finally { setApprovingId(null); }
  };

  // ── reject ─────────────────────────────────────────────────────────────────
  const openReject = (record) => {
    setRejectTarget(record);
    rejectForm.resetFields();
    setRejectVisible(true);
  };

  const submitReject = async () => {
    let values;
    try { values = await rejectForm.validateFields(); } catch { return; }
    setRejectSubmitting(true);
    try {
      const res = await request.patch({
        entity: `stakeholder-requirement/reject/${rejectTarget._id}`,
        jsonData: { rejectionReason: values.rejectionReason },
      });
      if (res?.success) {
        message.success(`Rejected — ${rejectTarget.senderName}`);
        setRejectVisible(false);
        setRequirements((prev) =>
          prev.map((r) =>
            r._id === rejectTarget._id
              ? { ...r, status: 'rejected', rejectionReason: values.rejectionReason,
                  rejectedBy: authUser, rejectedAt: new Date().toISOString() }
              : r
          )
        );
      }
    } catch (err) {
      message.error(err?.response?.data?.message || 'Rejection failed.');
    } finally { setRejectSubmitting(false); }
  };

  // ── reverse approval ───────────────────────────────────────────────────────
  const openReverse = (record) => {
    setReverseTarget(record);
    reverseForm.resetFields();
    setReverseVisible(true);
  };

  const submitReverse = async () => {
    let values;
    try { values = await reverseForm.validateFields(); } catch { return; }
    setReverseSubmitting(true);
    try {
      const res = await request.patch({
        entity: `stakeholder-requirement/reverse/${reverseTarget._id}`,
        jsonData: { reverseReason: values.reverseReason },
      });
      if (res?.success) {
        message.success(`Approval reversed — ${reverseTarget.senderName}`);
        setReverseVisible(false);
        setRequirements((prev) =>
          prev.map((r) =>
            r._id === reverseTarget._id
              ? { ...r, status: 'rejected', rejectionReason: values.reverseReason,
                  approvedBy: null, approvedAt: null,
                  rejectedBy: authUser, rejectedAt: new Date().toISOString() }
              : r
          )
        );
      }
    } catch (err) {
      message.error(err?.response?.data?.message || 'Reversal failed. Please try again.');
    } finally { setReverseSubmitting(false); }
  };

  // ── view detail ────────────────────────────────────────────────────────────
  const viewDetail = async (record) => {
    setDetailLoading(true);
    setDetailVisible(true);
    setSelected(null);
    try {
      const res = await request.read({ entity: 'stakeholder-requirement', id: record._id });
      if (res?.success) setSelected(res.result);
      else message.error('Unable to load details.');
    } catch { message.error('Unable to load details.');
    } finally { setDetailLoading(false); }
  };

  const canAct = (status) => ['submitted', 'enhancement_pending'].includes(status);

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
      width: 140,
      render: (_, r) => fullName(r.approvedBy),
    },
    {
      title: <b>Rejected By</b>,
      key: 'rejectedBy',
      width: 140,
      render: (_, r) => fullName(r.rejectedBy),
    },
    {
      // Reference template column — shows downloadable template for this row's stakeholder
      title: (
        <Tooltip title="Reference template for the stakeholder linked to this requirement">
          <b>Template</b>
        </Tooltip>
      ),
      key: 'template',
      width: 210,
      render: (_, r) => {
        const spId = r.stakeholder?._id || r.stakeholder;
        // Specific template wins; fall back to global template if none specific
        const tmpl = spId
          ? (templateMap[spId] || templateMap['__global__'] || null)
          : (templateMap['__global__'] || null);
        if (!tmpl) return <Text type="secondary">—</Text>;
        return (
          <Tooltip title={`Download: ${tmpl.file?.name}${tmpl.isGlobal ? ' (Global — applies to all providers)' : ''}`}>
            <Button
              type="link"
              size="small"
              icon={<FileTextOutlined />}
              style={{
                color: tmpl.isGlobal ? '#722ed1' : '#1a5c38',
                padding: 0, maxWidth: 200,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
              onClick={() => {
                const link = document.createElement('a');
                link.href = tmpl.file.url;
                link.download = tmpl.file.name;
                link.click();
              }}
            >
              {tmpl.title || tmpl.file?.name}
              {tmpl.isGlobal && (
                <Tag color="purple" style={{ fontSize:9, padding:'0 3px', marginLeft:4 }}>Global</Tag>
              )}
            </Button>
          </Tooltip>
        );
      },
    },
    {
      title: <b>Action</b>,
      key: 'action',
      width: 160,
      render: (_, r) => {
        const actable = canApprove && canAct(r.status);
        const options = [
          { value: 'view',    label: '👁  View Detail' },
          ...(actable ? [
            { value: 'approve', label: '✅  Approve' },
            { value: 'reject',  label: '❌  Reject'  },
          ] : []),
          ...(canApprove && r.status === 'approved' ? [
            { value: 'reverse', label: '↩️  Reverse Approval' },
          ] : []),
        ];
        return (
          <Select
            placeholder="Select action"
            size="small"
            style={{ width: 148 }}
            value={null}
            onChange={(val) => {
              if (val === 'view')    viewDetail(r);
              if (val === 'approve') handleApprove(r);
              if (val === 'reject')  openReject(r);
              if (val === 'reverse') openReverse(r);
            }}
            options={options}
            loading={approvingId === r._id}
          />
        );
      },
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '0 0 40px' }}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16,
        padding: '16px 20px',
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Approve Requirement</Title>
          <Text type="secondary">Review, view attachments, then approve or reject.</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>
          Refresh
        </Button>
      </div>

      {!canApprove && (
        <Alert
          style={{ marginBottom: 16 }}
          type="warning"
          showIcon
          message="Read-only access — Approve / Reject requires additional permission."
        />
      )}

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <Card
        bodyStyle={{ padding: 0 }}
        style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}
      >
        <Table
          dataSource={requirements}
          rowKey="_id"
          columns={columns}
          loading={loading}
          bordered={false}
          size="middle"
          scroll={{ x: 900 }}
          rowClassName={(_, idx) =>
            idx % 2 === 0 ? 'table-row-light' : 'table-row-dark'
          }
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total, range) => `${range[0]}–${range[1]} of ${total} entries`,
            position: ['bottomCenter'],
          }}
          locale={{ emptyText: 'No requirements found.' }}
          style={{ borderRadius: 0 }}
        />
      </Card>

      {/* ── Detail Modal ─────────────────────────────────────────────────── */}
      <Modal
        visible={detailVisible}
        title={<Space><EyeOutlined style={{ color: '#1a5c38' }} /><b>Requirement Details</b></Space>}
        onCancel={() => { setDetailVisible(false); setSelected(null); }}
        footer={
          <Space>
            {selected && canApprove && canAct(selected.status) && (
              <>
                <Popconfirm
                  title="Approve this requirement?"
                  onConfirm={() => { handleApprove(selected); setDetailVisible(false); }}
                  okText="Approve"
                  okButtonProps={{ style: { backgroundColor: '#1a5c38', borderColor: '#1a5c38' } }}
                >
                  <Button type="primary" icon={<CheckCircleOutlined />}
                    style={{ backgroundColor: '#1a5c38', borderColor: '#1a5c38' }}>
                    Approve
                  </Button>
                </Popconfirm>
                <Button danger icon={<CloseCircleOutlined />}
                  onClick={() => { setDetailVisible(false); openReject(selected); }}>
                  Reject
                </Button>
              </>
            )}
            <Button onClick={() => { setDetailVisible(false); setSelected(null); }}>Close</Button>
          </Space>
        }
        width={740}
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
            {selected.stakeholder && (
              <Descriptions.Item label="Stakeholder">
                <Tag color="geekblue" style={{ fontWeight: 500 }}>
                  {selected.stakeholder?.name || '—'}
                </Tag>
                {(() => {
                  const spId = selected.stakeholder?._id || selected.stakeholder;
                  // Specific template wins; fall back to global
                  const tmpl = spId
                    ? (templateMap[spId] || templateMap['__global__'] || null)
                    : (templateMap['__global__'] || null);
                  if (!tmpl) return null;
                  return (
                    <Tooltip title={`Download reference template: ${tmpl.file?.name}${tmpl.isGlobal ? ' (Global)' : ''}`}>
                      <Button
                        type="link"
                        size="small"
                        icon={<FileTextOutlined />}
                        style={{ color: tmpl.isGlobal ? '#722ed1' : '#1a5c38', marginLeft: 8 }}
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = tmpl.file.url;
                          link.download = tmpl.file.name;
                          link.click();
                        }}
                      >
                        {tmpl.isGlobal ? 'View Global Template' : 'View Template'}
                      </Button>
                    </Tooltip>
                  );
                })()}
              </Descriptions.Item>
            )}
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

            {/* ── Activity Log ─────────────────────────────────────── */}
            {Array.isArray(selected.activityLog) && selected.activityLog.length > 0 && (
              <Descriptions.Item label="Activity Log">
                <div style={{ width: '100%' }}>
                  {selected.activityLog.map((log, i) => {
                    const actionMeta = {
                      submitted:            { color: '#1677ff', bg: '#e6f4ff', border: '#91caff', label: 'Submitted'          },
                      approved:             { color: '#1a5c38', bg: '#f6ffed', border: '#b7eb8f', label: 'Approved'           },
                      rejected:             { color: '#cf1322', bg: '#fff1f0', border: '#ffa39e', label: 'Rejected'           },
                      enhancement_submitted:{ color: '#d46b08', bg: '#fff7e6', border: '#ffd591', label: 'Enhancement Sent'   },
                      approval_reversed:    { color: '#531dab', bg: '#f9f0ff', border: '#d3adf7', label: 'Approval Reversed'  },
                    };
                    const meta = actionMeta[log.action] || { color: '#595959', bg: '#fafafa', border: '#d9d9d9', label: log.action };
                    const who = log.performedBy
                      ? `${log.performedBy.firstName || ''} ${log.performedBy.lastName || ''}`.trim()
                      : '—';
                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex', gap: 12, marginBottom: 8,
                          padding: '8px 12px', borderRadius: 6,
                          background: meta.bg, border: `1px solid ${meta.border}`,
                        }}
                      >
                        {/* Timeline dot */}
                        <div style={{
                          width: 10, height: 10, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                          background: meta.color,
                        }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong style={{ color: meta.color, fontSize: 13 }}>{meta.label}</Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {log.performedAt ? new Date(log.performedAt).toLocaleString() : ''}
                            </Text>
                          </div>
                          <div style={{ marginTop: 2 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>By: {who}</Text>
                          </div>
                          {log.note && (
                            <div style={{ marginTop: 4 }}>
                              <Text style={{ fontSize: 12 }}>{log.note}</Text>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* ── Reject Modal ─────────────────────────────────────────────────── */}
      <Modal
        visible={rejectVisible}
        title={<Space><CloseCircleOutlined style={{ color: '#ff4d4f' }} /><b>Reject Requirement</b></Space>}
        onCancel={() => setRejectVisible(false)}
        onOk={submitReject}
        okText="Confirm Rejection"
        okButtonProps={{ danger: true, loading: rejectSubmitting }}
        cancelText="Cancel"
        width={440}
        destroyOnClose
      >
        <Form form={rejectForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item label="Date">
            <Input readOnly value={new Date().toLocaleDateString()}
              style={{ cursor: 'default' }} />
          </Form.Item>
          <Form.Item label="Name">
            <Input readOnly value={approverName}
              style={{ cursor: 'default' }} />
          </Form.Item>
          <Form.Item
            label="Reason"
            name="rejectionReason"
            rules={[
              { required: true, message: 'Please enter a reason.' },
              { min: 10, message: 'At least 10 characters required.' },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Explain why this requirement is being rejected…"
              showCount
              maxLength={500}
              autoFocus
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Reverse Approval Modal ───────────────────────────────────────── */}
      <Modal
        visible={reverseVisible}
        title={
          <Space>
            <span style={{ fontSize: 16 }}>↩️</span>
            <b style={{ color: '#531dab' }}>Reverse Approval</b>
          </Space>
        }
        onCancel={() => setReverseVisible(false)}
        onOk={submitReverse}
        okText="Confirm Reversal"
        okButtonProps={{ style: { backgroundColor: '#531dab', borderColor: '#531dab' }, loading: reverseSubmitting }}
        cancelText="Cancel"
        width={460}
        destroyOnClose
      >
        <Alert
          type="warning"
          showIcon
          message="This action will reverse the approval and set the requirement back to Rejected. The full activity will be recorded for accountability."
          style={{ marginBottom: 16 }}
        />
        <Form form={reverseForm} layout="vertical" style={{ marginTop: 4 }}>
          <Form.Item label="Date">
            <Input readOnly value={new Date().toLocaleDateString()}
              style={{ cursor: 'default' }} />
          </Form.Item>
          <Form.Item label="Approver Name">
            <Input readOnly value={approverName}
              style={{ cursor: 'default' }} />
          </Form.Item>
          <Form.Item
            label="Reason for Reversal"
            name="reverseReason"
            rules={[
              { required: true, message: 'Please enter a reason.' },
              { min: 10, message: 'At least 10 characters required.' },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Explain why this approval is being reversed…"
              showCount
              maxLength={500}
              autoFocus
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Row zebra stripe styles ───────────────────────────────────────── */}
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
