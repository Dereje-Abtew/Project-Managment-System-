import React, { useEffect, useState, useCallback } from 'react';
import {
  Alert, Button, Card, Col, Descriptions, Form, Input,
  Modal, Popconfirm, Row, Select, Space, Table, Tag,
  Tooltip, Typography, Upload, message,
} from 'antd';
import {
  DeleteOutlined, DownloadOutlined, EyeOutlined,
  FileTextOutlined, GlobalOutlined, PlusOutlined,
  ReloadOutlined, UploadOutlined,
} from '@ant-design/icons';
import request from '@/request/request';
import { GetPermissions } from '@/utils/permissionsUtils';
import cryptoHelper from '@/utils/crypto';
import { AUTH_LOCAL_STORAGE } from '@/constants/localStorageKeyConstants';

const { Title, Text } = Typography;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getAuthUser() {
  const raw = window.localStorage.getItem(AUTH_LOCAL_STORAGE);
  if (!raw) return null;
  try { return cryptoHelper.decrypt(raw) || JSON.parse(raw); } catch { return null; }
}
function fullName(u) {
  if (!u) return '—';
  return `${u.firstName || ''} ${u.lastName || ''}`.trim() || '—';
}
function fileColor(n) {
  return (n || '').toLowerCase().endsWith('.pdf') ? '#e53935' : '#1565c0';
}
function downloadFile(f) {
  try {
    const a = document.createElement('a');
    a.href = f.url; a.download = f.name; a.click();
  } catch { message.error('Could not download the file.'); }
}

// Sentinel value used in the select to represent "All Stakeholders"
const ALL_VALUE = 'all';

export default function RequirementTemplate() {
  const [form] = Form.useForm();

  const permissions = GetPermissions('requirement template');
  const canCreate = permissions.includes('create');
  const canDelete = permissions.includes('delete');

  const authUser     = getAuthUser();
  const uploaderName = authUser
    ? `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() : '';

  const [templates,     setTemplates]     = useState([]);
  const [providers,     setProviders]     = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [file,          setFile]          = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selected,      setSelected]      = useState(null);
  const [deletingId,    setDeletingId]    = useState(null);
  // Track what is currently chosen in the SP select — to show contextual hint
  const [chosenSp,      setChosenSp]      = useState(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request.list({ entity: 'requirement-template' });
      setTemplates(Array.isArray(res?.result) ? res.result : []);
    } catch { message.error('Unable to load templates.');
    } finally { setLoading(false); }
  }, []);

  const loadProviders = useCallback(async () => {
    try {
      // Fetch users with "Stakeholder" position
      const res = await request.filter({ 
        entity: 'user',
        options: { 
          filter: 'position',
          equal: 'Stakeholder'
        }
      });
      // Transform users to look like stakeholders
      const users = Array.isArray(res?.result) ? res.result : [];
      const transformed = users.map(u => ({
        _id: u._id,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        company: u.company || '',
      }));
      setProviders(transformed);
    } catch (err) { 
      console.error('Error loading stakeholder users:', err);
      /* non-fatal - just won't show providers */ 
    }
  }, []);

  useEffect(() => { loadTemplates(); loadProviders(); }, [loadTemplates, loadProviders]);

  // ── File picker ────────────────────────────────────────────────────────────
  const handleBeforeUpload = (f) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    if (!allowed.some(ext => f.name.toLowerCase().endsWith(ext))) {
      message.error(`"${f.name}" is not allowed. Only PDF or Word files.`);
      return Upload.LIST_IGNORE;
    }
    const reader = new FileReader();
    reader.onload = e => setFile({ name: f.name, url: e.target.result });
    reader.readAsDataURL(f);
    return Upload.LIST_IGNORE;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (values) => {
    if (!file) {
      message.warning('Please choose a template file before uploading.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await request.create({
        entity: 'requirement-template',
        jsonData: {
          stakeholder: values.stakeholder,   // "all" or ObjectId string
          title:           values.title || file.name,
          file,
        },
      });
      if (res?.success) {
        const isGlobal = values.stakeholder === ALL_VALUE;
        message.success(
          isGlobal
            ? 'Global template uploaded — applies to all stakeholders.'
            : 'Template uploaded successfully.'
        );
        form.resetFields();
        setFile(null);
        setChosenSp(null);
        loadTemplates();
      }
    } catch { message.error('Upload failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await request.delete({ entity: 'requirement-template', id });
      if (res?.success) {
        message.success('Template deleted.');
        setTemplates(prev => prev.filter(t => t._id !== id));
      }
    } catch { message.error('Delete failed. Please try again.');
    } finally { setDeletingId(null); }
  };

  const viewDetail = (r) => { setSelected(r); setDetailVisible(true); };

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    {
      title: <b>#</b>, key:'serial', width:52, align:'center',
      render:(_, __, i) => <Text type="secondary">{i+1}</Text>,
    },
    {
      title: <b>Title</b>, dataIndex:'title', key:'title',
      render:(val, r) => (
        <Space>
          <FileTextOutlined style={{ color: fileColor(r.file?.name) }} />
          <Text strong>{val || r.file?.name || '—'}</Text>
        </Space>
      ),
    },
    {
      title: <b>Stakeholder</b>, key:'sp',
      render:(_, r) => r.isGlobal ? (
        <Tag color="purple" icon={<GlobalOutlined />} style={{ fontWeight:600 }}>
          All Stakeholders
        </Tag>
      ) : (
        <Tag color="geekblue" style={{ fontWeight:500 }}>
          {r.stakeholder?.name || '—'}
        </Tag>
      ),
    },
    {
      title: <b>Uploaded By</b>, key:'uploadedBy',
      render:(_, r) => fullName(r.uploadedBy),
    },
    {
      title: <b>Uploaded At</b>, key:'uploadedAt', width:180,
      render:(_, r) => r.uploadedAt ? new Date(r.uploadedAt).toLocaleString() : '—',
    },
    {
      title: <b>File</b>, key:'file', width:90, align:'center',
      render:(_, r) => r.file?.url ? (
        <Tooltip title={`Download — ${r.file.name}`}>
          <Button type="link" size="small" icon={<DownloadOutlined />}
            style={{ color:'#1a5c38' }} onClick={() => downloadFile(r.file)} />
        </Tooltip>
      ) : <Text type="secondary">—</Text>,
    },
    {
      title: <b>Action</b>, key:'action', width:110,
      render:(_, r) => (
        <Space size={4}>
          <Tooltip title="View Detail">
            <Button type="link" size="small" icon={<EyeOutlined />}
              style={{ color:'#1a5c38' }} onClick={() => viewDetail(r)} />
          </Tooltip>
          {canDelete && (
            <Popconfirm
              title="Delete this template?"
              description={r.isGlobal
                ? 'This is a GLOBAL template. Deleting it removes the template for ALL providers.'
                : 'This action cannot be undone.'}
              onConfirm={() => handleDelete(r._id)}
              okText="Delete" okButtonProps={{ danger:true }} cancelText="Cancel"
            >
              <Tooltip title="Delete">
                <Button type="link" size="small" danger icon={<DeleteOutlined />}
                  loading={deletingId === r._id} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // Build select options: "All" first, then individual providers
  const spOptions = [
    {
      value: ALL_VALUE,
      label: '🌐  All Stakeholders',
    },
    ...providers.map(p => ({
      value: p._id,
      label: p.name + (p.company ? ` (${p.company})` : ''),
    })),
  ];

  return (
    <div style={{ paddingBottom:40 }}>

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        marginBottom:16, padding:'16px 20px',
        background:'#fff', borderRadius:8, boxShadow:'0 1px 4px rgba(0,0,0,0.07)',
      }}>
        <div>
          <Title level={4} style={{ margin:0 }}>Requirement Templates</Title>
          <Text type="secondary">
            Upload a reference template per stakeholder — or select <b>All</b> to apply one
            template to every provider. Senders must download and use this as the basis of their submission.
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadTemplates} loading={loading}>Refresh</Button>
      </div>

      {/* ── Upload Form ──────────────────────────────────────────────────── */}
      {canCreate ? (
        <Card
          title={<Space><PlusOutlined style={{ color:'#1a5c38' }} /><span>Upload New Template</span></Space>}
          style={{ marginBottom:24, borderRadius:8, boxShadow:'0 1px 4px rgba(0,0,0,0.07)', borderTop:'3px solid #1a5c38' }}
          bodyStyle={{ padding:'20px 24px' }}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>

              {/* Uploaded By — read-only */}
              <Col xs={24} sm={8}>
                <Form.Item label="Uploaded By">
                  <Input readOnly value={uploaderName}
                    style={{ cursor:'default' }} />
                </Form.Item>
              </Col>

              {/* Upload Date — auto */}
              <Col xs={24} sm={8}>
                <Form.Item label="Upload Date">
                  <Input readOnly value={new Date().toLocaleDateString()}
                    style={{ cursor:'default' }} />
                </Form.Item>
              </Col>

              {/* Stakeholder — includes "All" as first option */}
              <Col xs={24} sm={8}>
                <Form.Item
                  label="Stakeholder"
                  name="stakeholder"
                  rules={[{ required:true, message:'Please select a stakeholder.' }]}
                  extra={
                    chosenSp === ALL_VALUE ? (
                      <Text style={{ color:'#722ed1', fontSize:12 }}>
                        <GlobalOutlined /> This template will be used by <b>all</b> stakeholders
                        that do not have their own specific template.
                      </Text>
                    ) : null
                  }
                >
                  <Select
                    placeholder="Select stakeholder…"
                    showSearch
                    optionFilterProp="label"
                    options={spOptions.map(opt => ({
                      ...opt,
                      label: opt.value === ALL_VALUE ? (
                        <Space>
                          <GlobalOutlined style={{ color:'#722ed1' }} />
                          <Text strong style={{ color:'#722ed1' }}>All Stakeholders</Text>
                          <Tag color="purple" style={{ fontSize:10, padding:'0 4px' }}>Global</Tag>
                        </Space>
                      ) : opt.label
                    }))}
                    onChange={v => setChosenSp(v)}
                    notFoundContent={
                      <Text type="secondary" style={{ fontSize:12 }}>
                        No stakeholders registered yet.
                      </Text>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              {/* Title */}
              <Col xs={24} sm={12}>
                <Form.Item
                  label={<span>Template Title <Text type="secondary" style={{ fontWeight:400 }}>(optional — defaults to file name)</Text></span>}
                  name="title"
                >
                  <Input placeholder="e.g. Software Procurement Template v2" maxLength={120} />
                </Form.Item>
              </Col>

              {/* File */}
              <Col xs={24} sm={12}>
                <Form.Item label={
                  <span>
                    <span style={{ color:'#ff4d4f' }}>* </span>
                    Template File <Text type="secondary" style={{ fontWeight:400 }}>(PDF / DOC / DOCX)</Text>
                  </span>
                }>
                  <div style={{ border:'1px dashed #d9d9d9', borderRadius:8, padding:'12px 16px', background:'#fafafa' }}>
                    <Upload beforeUpload={handleBeforeUpload} showUploadList={false} accept=".pdf,.doc,.docx">
                      <Button icon={<UploadOutlined />}>Choose Template File</Button>
                    </Upload>
                    {file && (
                      <div style={{
                        display:'flex', alignItems:'center', gap:10, marginTop:10,
                        padding:'6px 12px', background:'#fff', borderRadius:6, border:'1px solid #dde4f0',
                      }}>
                        <FileTextOutlined style={{ color:fileColor(file.name), fontSize:16 }} />
                        <Text style={{ flex:1 }}>{file.name}</Text>
                        <Button type="link" size="small" danger onClick={() => setFile(null)} style={{ padding:0 }}>
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginBottom:0 }}>
              <Button type="primary" htmlType="submit" loading={submitting} icon={<UploadOutlined />}
                style={{ backgroundColor:'#1a5c38', borderColor:'#1a5c38', minWidth:200 }}>
                Upload Template
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ) : (
        <Alert style={{ marginBottom:20 }} type="warning" showIcon
          message="You do not have permission to upload requirement templates." />
      )}

      {/* ── Templates Table ──────────────────────────────────────────────── */}
      <Card bodyStyle={{ padding:0 }}
        style={{ borderRadius:8, boxShadow:'0 1px 4px rgba(0,0,0,0.07)', overflow:'hidden' }}>
        <Table
          dataSource={templates}
          rowKey="_id"
          columns={columns}
          loading={loading}
          size="middle"
          scroll={{ x:900 }}
          rowClassName={(r, i) =>
            r.isGlobal
              ? 'table-row-global'
              : i % 2 === 0 ? 'table-row-light' : 'table-row-dark'
          }
          pagination={{
            pageSize:10, showSizeChanger:true,
            pageSizeOptions:['10','20','50'],
            showTotal:(total, range) => `${range[0]}–${range[1]} of ${total} templates`,
            position:['bottomCenter'],
          }}
          locale={{ emptyText:'No templates uploaded yet.' }}
        />
      </Card>

      {/* ── Detail Modal ─────────────────────────────────────────────────── */}
      <Modal
        visible={detailVisible}
        title={<Space><FileTextOutlined style={{ color:'#1a5c38' }} /><b>Template Details</b></Space>}
        onCancel={() => { setDetailVisible(false); setSelected(null); }}
        footer={
          <Space>
            {selected?.file?.url && (
              <Button type="primary" icon={<DownloadOutlined />}
                style={{ backgroundColor:'#1a5c38', borderColor:'#1a5c38' }}
                onClick={() => downloadFile(selected.file)}>
                Download Template
              </Button>
            )}
            <Button onClick={() => { setDetailVisible(false); setSelected(null); }}>Close</Button>
          </Space>
        }
        width={600} destroyOnClose
      >
        {selected && (
          <Descriptions bordered column={1} size="small"
            labelStyle={{ width:160, fontWeight:500, background:'#f8faff' }}>
            <Descriptions.Item label="Title">
              {selected.title || selected.file?.name || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Stakeholder">
              {selected.isGlobal ? (
                <Tag color="purple" icon={<GlobalOutlined />} style={{ fontWeight:600 }}>
                  All Stakeholders (Global)
                </Tag>
              ) : (
                <>
                  <Tag color="geekblue" style={{ fontWeight:500 }}>
                    {selected.stakeholder?.name || '—'}
                  </Tag>
                  {selected.stakeholder?.company && (
                    <Text type="secondary" style={{ marginLeft:8 }}>
                      {selected.stakeholder.company}
                    </Text>
                  )}
                </>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Uploaded By">{fullName(selected.uploadedBy)}</Descriptions.Item>
            <Descriptions.Item label="Upload Date">
              {selected.uploadedAt ? new Date(selected.uploadedAt).toLocaleString() : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="File">
              {selected.file ? (
                <div style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'6px 12px', background:'#f8faff',
                  borderRadius:6, border:'1px solid #dde4f0',
                }}>
                  <FileTextOutlined style={{ color:fileColor(selected.file.name), fontSize:16 }} />
                  <a href={selected.file.url} target="_blank" rel="noreferrer"
                    style={{ flex:1, color:'#1a5c38' }}>
                    {selected.file.name}
                  </a>
                  <Tooltip title="Download">
                    <Button type="link" size="small" icon={<DownloadOutlined />}
                      onClick={() => downloadFile(selected.file)} style={{ padding:0, color:'#1a5c38' }} />
                  </Tooltip>
                </div>
              ) : <Text type="secondary">—</Text>}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* ── Table styles ─────────────────────────────────────────────────── */}
      <style>{`
        .table-row-light  td { background:#ffffff !important; }
        .table-row-dark   td { background:#f8faff !important; }
        .table-row-global td { background:#f9f0ff !important; }
        .ant-table-thead > tr > th {
          background:#1a5c38 !important; color:#fff !important;
          font-weight:600 !important; white-space:nowrap;
        }
        .ant-table-thead > tr > th .anticon { color:#fff !important; }
        .ant-pagination { margin-top:16px !important; }
      `}</style>
    </div>
  );
}
