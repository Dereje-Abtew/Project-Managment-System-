import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert, Button, Card, Col, Divider, Form, Input,
  Modal, Row, Space, Table, Tag, Typography,
  message, Select, Popconfirm, Tooltip,
} from 'antd';

import dayjs from 'dayjs';
import request from '@/request/request';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';

const { Title, Text } = Typography;

const BRAND = '#1a5c38';
const BRAND_LIGHT = '#f0f7f4';

// ── Helpers ─────────────────────────────────────────────────────────────────

function StatusTag({ status }) {
  if (status === 'submitted')
    return <Tag icon={<span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>check_circle</span>} color="success">Responded</Tag>;
  return <Tag icon={<span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>pending</span>} color="warning">Pending</Tag>;
}

// ── Async Project Select ────────────────────────────────────────────────────
function ProjectSelect({ value, onChange, onProjectSelected }) {
  const [opts, setOpts] = useState([]);
  const [full, setFull] = useState([]);
  const [busy, setBusy] = useState(false);
  const timer = useRef(null);

  const fetch = useCallback(async (q) => {
    setBusy(true);
    try {
      const res = q
        ? await request.search({ entity: 'project', options: { q, fields: 'title,projectNumber' } })
        : await request.list({ entity: 'project', options: { items: 50 } });
      const data = Array.isArray(res?.result) ? res.result : [];
      setFull(data);
      setOpts(data.map((p) => ({ value: p._id, label: p.title })));
    } catch { /* silent */ }
    finally { setBusy(false); }
  }, []);

  useEffect(() => { fetch(''); }, [fetch]);

  return (
    <Select
      showSearch filterOption={false} loading={busy} value={value}
      placeholder="Search Project..." style={{ width: '100%' }}
      onSearch={(q) => { clearTimeout(timer.current); timer.current = setTimeout(() => fetch(q), 300); }}
      onChange={(id) => {
        if (onChange) onChange(id);
        if (onProjectSelected) {
          const p = full.find((x) => x._id === id);
          if (p) onProjectSelected(p);
        }
      }}
      options={opts}
    />
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function UATSignOff() {
  document.title = 'UAT Sign Offs - PMS';
  const { current } = useSelector(selectAuth);
  const userName = current
    ? `${current.firstName || ''} ${current.lastName || ''}`.trim()
    : '';

  const [form] = Form.useForm();
  const [featureForm] = Form.useForm();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');

  // Create / Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // UAT Features state (the details)
  const [featuresList, setFeaturesList] = useState([]);
  const [featureModalVisible, setFeatureModalVisible] = useState(false);

  // ── Load Data ─────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request.list({ entity: 'uat-signoff' });
      const data = Array.isArray(res?.result) ? res.result : [];
      // Sort newest first
      setRecords(data.sort((a, b) => new Date(b.created) - new Date(a.created)));
    } catch { message.error('Failed to load UAT records.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredRecords = records.filter((r) => {
    const q = filterSearch.toLowerCase();
    if (!q) return true;
    return (
      r.uatNumber?.toLowerCase().includes(q) ||
      r.sentBy?.toLowerCase().includes(q) ||
      r.project?.title?.toLowerCase().includes(q)
    );
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreateNew = () => {
    form.resetFields();
    form.setFieldsValue({
      sentBy: userName,
      date: dayjs().format('YYYY-MM-DD'),
    });
    setFeaturesList([]);
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (rec) => {
    setIsEditing(true);
    setEditId(rec._id);
    form.setFieldsValue({
      project: rec.project?._id,
      sentBy: rec.sentBy,
      date: rec.date ? dayjs(rec.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      serviceProvider: rec.serviceProvider?._id,
    });
    setFeaturesList(rec.features || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      const res = await request.delete({ entity: 'uat-signoff', id });
      if (res?.success) { message.success('Record deleted.'); load(); }
    } catch { message.error('Delete failed.'); }
  };

  const submitMaster = async () => {
    try {
      const values = await form.validateFields();

      if (featuresList.length === 0) {
        message.error('Please add at least one UAT Feature item.');
        return;
      }

      if (featuresList.length > 20) {
        message.warning('Maximum 20 UAT items allowed.');
        return;
      }

      setSubmitting(true);

      const payload = {
        sentBy: values.sentBy,
        date: new Date().toISOString(),
        project: values.project,
        serviceProvider: values.serviceProvider, // Might be undefined if no SP linked, backend should handle
        features: featuresList.map((f, i) => ({ ...f, no: i + 1 })),
      };

      const res = isEditing
        ? await request.patch({ entity: `uat-signoff/update/${editId}`, jsonData: payload })
        : await request.create({ entity: 'uat-signoff', jsonData: payload });

      if (res?.success) {
        message.success(isEditing ? 'UAT record updated successfully.' : 'UAT record created successfully.');
        handleCreateNew();
        load();
      } else { message.error(res?.message || 'Save failed.'); }
    } catch (err) {
      if (err.errorFields) message.error('Please complete all required fields.');
      else message.error('Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Open Feature Modal ────────────────────────────────────────────────────
  const openFeatureModal = () => {
    featureForm.setFieldsValue({
      items: featuresList.length > 0 ? featuresList : [{ no: 1, feature: '', businessValidationConfirmed: '', pass: false, fail: false, remark: '' }],
    });
    setFeatureModalVisible(true);
  };

  const saveFeaturesFromModal = async () => {
    try {
      const values = await featureForm.validateFields();
      if (!values.items || values.items.length < 2) {
        message.warning('Please add at least 2 UAT items for a proper test plan.');
        return;
      }
      if (values.items.length > 20) {
        message.error('You can add up to 20 items maximum.');
        return;
      }
      setFeaturesList(values.items);
      setFeatureModalVisible(false);
    } catch (e) {
      message.error('Please fill in the required fields correctly.');
    }
  };

  // ── Render Expanded Row (Detail Table) ────────────────────────────────────
  const expandedRowRender = (record) => {
    const detailCols = [
      { title: 'No.', dataIndex: 'no', key: 'no', width: 60, align: 'center', render: (t) => <b>{t}</b> },
      { title: 'Feature / Capability', dataIndex: 'feature', key: 'feature' },
      { title: 'Business Validation Confirmed', dataIndex: 'businessValidationConfirmed', key: 'bvc', width: '30%' },
      { title: 'Pass', dataIndex: 'pass', key: 'pass', width: 80, align: 'center', render: (val) => val ? <span className="material-symbols-outlined" style={{ color: '#4caf50', verticalAlign: 'middle', fontSize: 20 }}>check_circle</span> : <span style={{ color: '#ccc' }}>—</span> },
      { title: 'Fail', dataIndex: 'fail', key: 'fail', width: 80, align: 'center', render: (val) => val ? <span className="material-symbols-outlined" style={{ color: '#f44336', verticalAlign: 'middle', fontSize: 20 }}>cancel</span> : <span style={{ color: '#ccc' }}>—</span> },
      { title: 'Remarks', dataIndex: 'remark', key: 'remark', render: (t) => t || <Text type="secondary">—</Text> },
    ];
    return (
      <div style={{ margin: '10px 30px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 8, padding: 4 }}>
        <Table
          columns={detailCols}
          dataSource={record.features || []}
          pagination={false}
          size="small"
          rowKey="_id"
        />
      </div>
    );
  };

  // ── Main Table Columns ────────────────────────────────────────────────────
  const columns = [
    {
      title: <b>UAT No</b>, dataIndex: 'uatNumber', key: 'uatNumber', width: 120,
      render: (v) => <Tag color="geekblue">{v || '—'}</Tag>,
    },
    {
      title: <b>Prepared By</b>, dataIndex: 'sentBy', key: 'sentBy',
    },
    {
      title: <b>Project Name</b>, key: 'project',
      render: (_, r) => <Text strong>{r.project?.title || '—'}</Text>,
    },
    {
      title: <b>Created Date</b>, key: 'date', width: 150,
      render: (_, r) => r.date ? dayjs(r.date).format('MMM DD, YYYY') : '—',
    },
    {
      title: <b>Status</b>, key: 'status', width: 130,
      render: (_, r) => <StatusTag status={r.responseStatus} />,
    },
    {
      title: <b>Actions</b>, key: 'actions', width: 120, align: 'center',
      render: (_, r) => (
        <Space size={8}>
          <Tooltip title="Edit">
            <Button size="small" type="primary" ghost onClick={() => handleEdit(r)}>Edit</Button>
          </Tooltip>
          <Tooltip title="Delete UAT">
            <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(r._id)}>
              <Button type="text" danger icon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div style={{ paddingBottom: 40, background: '#f5f7fa', minHeight: '100vh', padding: '24px' }}>

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, padding: '16px 24px',
        background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      }}>
        <Space align="center" size="middle">
          <div style={{ background: 'linear-gradient(135deg, #1a5c38 0%, #2e7d32 100%)', padding: 14, borderRadius: '50%', display: 'flex', boxShadow: '0 4px 12px rgba(26, 92, 56, 0.3)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#fff' }}>fact_check</span>
          </div>
          <div>
            <Title level={3} style={{ margin: 0, fontFamily: 'Roboto', fontWeight: 600, color: '#202124' }}>UAT Sign-Off</Title>
            <Text type="secondary" style={{ fontSize: 14, letterSpacing: 0.2 }}>Create and manage project UAT verifications</Text>
          </div>
        </Space>
      </div>

      {/* ── Master Creation Form ────────────────────────────────────────── */}
      <Card
        title={<span style={{ color: BRAND, fontWeight: 600, fontSize: 16 }}><span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: 8 }}>{isEditing ? 'edit_square' : 'add_circle'}</span>{isEditing ? 'Edit UAT Record' : 'Create UAT Record'}</span>}
        style={{
          marginBottom: 24, borderRadius: 16,
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
          border: 'none',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: 32 }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={24} align="top">
            <Col xs={24} md={8}>
              <Form.Item label="Prepared By" name="sentBy" initialValue={userName} rules={[{ required: true }]}>
                <Input readOnly style={{ background: '#f5f5f5', cursor: 'default' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Created Date" name="date" initialValue={dayjs().format('YYYY-MM-DD')}>
                <Input readOnly style={{ background: '#f5f5f5', cursor: 'default' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label={<Text strong>Project Name <span style={{ color: 'red' }}>*</span></Text>} name="project" rules={[{ required: true, message: 'Please select a project' }]}>
                <ProjectSelect onProjectSelected={(p) => {
                  form.setFieldsValue({ serviceProvider: p.ownerName?._id || undefined });
                }} />
              </Form.Item>
            </Col>
          </Row>

          {/* Hidden field for SP compatibility with backend */}
          <Form.Item name="serviceProvider" hidden><Input /></Form.Item>

          <Divider style={{ margin: '12px 0 24px' }} />

          {/* ── Feature Uploader Section ──────────────────────────────────── */}
          <Row align="middle" justify="space-between" style={{ marginBottom: 16 }}>
            <Col>
              <Text strong style={{ fontSize: 16 }}>Test Items (Features & Capabilities)</Text><br />
              <Text type="secondary">Configure 2 to 20 test items for business validation.</Text>
            </Col>
            <Col>
              <Button type="dashed" onClick={openFeatureModal} style={{ borderColor: BRAND, color: BRAND, fontWeight: 500, borderRadius: 8, height: 40, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_circle</span>
                {featuresList.length > 0 ? `Edit ${featuresList.length} Items` : 'Add UAT Items'}
              </Button>
            </Col>
          </Row>

          {featuresList.length > 0 ? (
            <div style={{ background: BRAND_LIGHT, border: `1px solid ${BRAND}`, borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong style={{ color: BRAND }}>
                  <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: 4, fontSize: 18 }}>check_circle</span> {featuresList.length} Features prepared.
                </Text>
                <div style={{ maxHeight: 150, overflowY: 'auto', background: '#fff', padding: 8, borderRadius: 4, border: '1px solid #d9d9d9' }}>
                  {featuresList.map((f, i) => (
                    <div key={i} style={{ borderBottom: i === featuresList.length - 1 ? 'none' : '1px solid #f0f0f0', padding: '4px 0' }}>
                      <Text type="secondary" style={{ marginRight: 8 }}>{i + 1}.</Text>
                      <Text>{f.feature}</Text>
                    </div>
                  ))}
                </div>
              </Space>
            </div>
          ) : (
            <Alert
              message="No test items defined."
              description="Click 'Add UAT Items' to define features for this UAT sign-off."
              type="info" showIcon style={{ marginBottom: 20 }}
            />
          )}

          <Col span={24} style={{ textAlign: 'right', marginTop: 16 }}>
            {isEditing && (
              <Button onClick={handleCreateNew} style={{ marginRight: 8, borderRadius: 20 }}>
                Cancel Edit
              </Button>
            )}
            <Button
              type="primary"
              onClick={submitMaster}
              loading={submitting}
              style={{ background: BRAND, borderColor: BRAND, borderRadius: 20, height: 40, padding: '0 24px', fontSize: 15, fontWeight: 500 }}
            >
              {isEditing ? 'Update Record' : 'Save & Create'}
            </Button>
          </Col>
        </Form>
      </Card>

      {/* ── Table List ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>UAT Records History</Title>
        <Space>
          <Input
            prefix={<span className="material-symbols-outlined" style={{ fontSize: 18, color: '#999' }}>search</span>}
            placeholder="Search Project, UAT No..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            style={{ width: 250, borderRadius: 20 }}
          />
          <Button icon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>} onClick={load} loading={loading} style={{ borderRadius: 20 }}>Refresh</Button>
        </Space>
      </div>

      <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <Table
          dataSource={filteredRecords}
          columns={columns}
          rowKey="_id"
          loading={loading}
          size="middle"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          className="master-material-table"
          expandable={{
            expandedRowRender,
            expandIcon: ({ expanded, onExpand, record }) =>
              expanded ? (
                <span className="material-symbols-outlined" onClick={e => onExpand(record, e)} style={{ color: '#5f6368', cursor: 'pointer', fontSize: 22, verticalAlign: 'middle', transition: 'all 0.2s' }}>keyboard_arrow_down</span>
              ) : (
                <span className="material-symbols-outlined" onClick={e => onExpand(record, e)} style={{ color: '#5f6368', cursor: 'pointer', fontSize: 22, verticalAlign: 'middle', transition: 'all 0.2s' }}>keyboard_arrow_right</span>
              )
          }}
          rowClassName={(_, i) => (i % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
        />
      </Card>

      {/* ── Feature List Popup Modal ─────────────────────────────────────── */}
      <Modal
        title={
          <Space align="center">
            <span className="material-symbols-outlined" style={{ color: BRAND, fontSize: 24 }}>playlist_add_check</span>
            <Text strong style={{ fontSize: 18, fontFamily: 'Roboto', color: '#202124' }}>UAT Form Items</Text>
          </Space>
        }
        visible={featureModalVisible}
        onCancel={() => setFeatureModalVisible(false)}
        onOk={saveFeaturesFromModal}
        okText="Confirm & Add"
        width={1000}
        destroyOnClose
        okButtonProps={{ style: { backgroundColor: BRAND, borderColor: BRAND } }}
      >
        <Alert message="Provide details for each test item. You can add up to 20 items." type="info" showIcon style={{ marginBottom: 16 }} />

        <Form form={featureForm} layout="vertical">
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                <div style={{ overflowX: 'auto' }}>
                  {/* Table Header Mimic */}
                  <div style={{
                    display: 'flex', gap: 8, background: '#fafafa', color: 'rgba(0, 0, 0, 0.85)', padding: '12px 16px',
                    fontWeight: 600, borderBottom: '1px solid #f0f0f0', minWidth: 700
                  }}>
                    <div style={{ width: 40, textAlign: 'center' }}>No.</div>
                    <div style={{ flex: 2 }}>Feature / Capability *</div>
                    <div style={{ flex: 2 }}>Business Validation Confirmed *</div>
                    <div style={{ flex: 1 }}>Remarks</div>
                    <div style={{ width: 40 }}></div>
                  </div>

                  {/* Dynamic Rows */}
                  <div style={{ borderBottom: '1px solid #f0f0f0', minWidth: 700 }}>
                    {fields.map((field, index) => (
                      <div key={field.key} style={{
                        display: 'flex', gap: 8, padding: '10px 12px', alignItems: 'flex-start',
                        background: index % 2 === 0 ? '#fff' : '#f8fafb', borderBottom: '1px solid #f0f0f0'
                      }}>
                        <div style={{ width: 40, textAlign: 'center', paddingTop: 6, fontWeight: 600, color: '#888' }}>
                          {index + 1}
                        </div>

                        <div style={{ flex: 2 }}>
                          <Form.Item {...field} name={[field.name, 'feature']} rules={[{ required: true, message: 'Required' }]} style={{ marginBottom: 0 }}>
                            <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} placeholder="Feature details..." />
                          </Form.Item>
                        </div>

                        <div style={{ flex: 2 }}>
                          <Form.Item {...field} name={[field.name, 'businessValidationConfirmed']} rules={[{ required: true, message: 'Required' }]} style={{ marginBottom: 0 }}>
                            <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} placeholder="Validation info..." />
                          </Form.Item>
                        </div>

                        <div style={{ flex: 1 }}>
                          <Form.Item {...field} name={[field.name, 'remark']} style={{ marginBottom: 0 }}>
                            <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} placeholder="Remark..." />
                          </Form.Item>
                        </div>

                        <div style={{ width: 40, textAlign: 'center', paddingTop: 6 }}>
                          {fields.length > 1 && (
                            <span 
                                className="material-symbols-outlined" 
                                onClick={() => remove(field.name)}
                                style={{ color: '#f44336', cursor: 'pointer', fontSize: 22, transition: '0.2s', opacity: 0.8 }}
                                onMouseEnter={e => e.target.style.opacity = 1}
                                onMouseLeave={e => e.target.style.opacity = 0.8}
                            >
                                delete
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '16px', background: '#fafafa', borderTop: '1px solid #f0f0f0', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
                  <Button
                    type="dashed"
                    onClick={() => {
                      if (fields.length >= 20) {
                        message.warning('Maximum 20 items reached.');
                      } else {
                        add({ feature: '', businessValidationConfirmed: '', pass: false, fail: false, remark: '' });
                      }
                    }}
                    style={{ width: '100%', borderColor: BRAND, color: BRAND, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span> Add New Item Row
                  </Button>
                </div>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* ── Styles ───────────────────────────────────────────────────────── */}
      <style>{`
        /* Ultra Premium Material Table Style Overrides */
        .ant-table {
          font-family: "Roboto", "Helvetica", "Arial", sans-serif;
          color: rgba(0, 0, 0, 0.87);
          border-radius: 8px;
          overflow: hidden;
        }
        .ant-table-container {
          border-radius: 12px;
          border: none;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }
        .master-material-table > .ant-table-container > .ant-table-content > table > .ant-table-thead > tr > th {
          background: #1a5c38 !important; 
          color: #ffffff !important;
          font-weight: 600 !important; 
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          white-space: nowrap;
          border-bottom: none !important;
          padding: 16px !important;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0 !important;
          font-size: 0.875rem;
          padding: 16px !important;
          color: #202124;
        }
        .ant-table-tbody > tr:hover > td { 
          background-color: rgba(0, 0, 0, 0.04) !important; 
        }
        .ant-pagination { 
          margin-top: 16px !important; 
          margin-right: 16px !important; 
        }
        .ant-table-row-expand-icon {
          display: none !important;
        }
        .ant-table-expanded-row > td {
          background: #fbfbfc !important;
          padding: 24px !important;
        }
        /* Nested Table Override - Remove Green Background */
        .ant-table-expanded-row .ant-table-thead > tr > th {
          background: #f1f3f4 !important;
          color: #5f6368 !important;
          border-bottom: 2px solid #e0e0e0 !important;
          padding: 12px 16px !important;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>
    </div>
  );
}
