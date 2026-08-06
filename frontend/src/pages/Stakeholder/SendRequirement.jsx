import React, { useEffect, useState } from 'react';
import {
  Alert, Button, Card, Col, Descriptions, Divider,
  Form, Input, Modal, Row, Select, Space, Steps,
  Table, Tag, Tooltip, Typography, Upload, message,
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, DownloadOutlined,
  EyeOutlined, FileOutlined, FileTextOutlined, PlusCircleOutlined,
  ReloadOutlined, UploadOutlined, WarningOutlined,
} from '@ant-design/icons';
import request from '@/request/request';
import { GetPermissions } from '@/utils/permissionsUtils';
import cryptoHelper from '@/utils/crypto';
import { AUTH_LOCAL_STORAGE } from '@/constants/localStorageKeyConstants';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Step } = Steps;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_COLOR = {
  submitted: 'orange', approved: 'green', rejected: 'red',
  enhancement_pending: 'blue', implemented: 'purple',
};
const STATUS_ICON = {
  approved: <CheckCircleOutlined />, rejected: <CloseCircleOutlined />,
};

function statusTag(s) {
  return (
    <Tag color={STATUS_COLOR[s] || 'default'} icon={STATUS_ICON[s]}
      style={{ textTransform: 'capitalize', fontWeight: 500 }}>
      {(s || '').replace(/_/g, ' ')}
    </Tag>
  );
}

function fullName(u) {
  if (!u) return '—';
  return `${u.firstName || ''} ${u.lastName || ''}`.trim() || '—';
}

function getAuthUser() {
  const raw = window.localStorage.getItem(AUTH_LOCAL_STORAGE);
  if (!raw) return null;
  try { return cryptoHelper.decrypt(raw) || JSON.parse(raw); } catch { return null; }
}

function downloadFile(f) {
  try {
    const a = document.createElement('a');
    a.href = f.url; a.download = f.name; a.click();
  } catch { message.error('Could not download the file.'); }
}

function fileColor(n) {
  return (n || '').toLowerCase().endsWith('.pdf') ? '#e53935' : '#1565c0';
}

// ─── AttachmentList ───────────────────────────────────────────────────────────
function AttachmentList({ attachments }) {
  if (!Array.isArray(attachments) || attachments.length === 0)
    return <Text type="secondary">—</Text>;
  const originals    = attachments.filter(a => !a.type || a.type === 'original');
  const enhancements = attachments.filter(a => a.type === 'enhancement');

  const renderFile = (a, i) => (
    <div key={`${a.name}-${i}`} style={{
      display:'flex', alignItems:'center', gap:10,
      padding:'6px 12px', background:'#fff',
      borderRadius:6, border:'1px solid #dde4f0', marginBottom:4,
    }}>
      <FileOutlined style={{ color: fileColor(a.name), fontSize:15 }} />
      <a href={a.url} target="_blank" rel="noreferrer"
        style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'#1a5c38' }}>
        {a.name}
      </a>
      <Tooltip title="Download">
        <Button type="link" size="small" icon={<DownloadOutlined />}
          onClick={() => downloadFile(a)} style={{ padding:0, color:'#1a5c38' }} />
      </Tooltip>
    </div>
  );

  return (
    <div style={{ width:'100%' }}>
      {originals.length > 0 && (
        <div style={{ marginBottom: enhancements.length ? 8 : 0 }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:6,
            background:'#e6f4ff', border:'1px solid #91caff',
            borderRadius:4, padding:'2px 10px', marginBottom:6,
          }}>
            <FileOutlined style={{ color:'#1677ff', fontSize:12 }} />
            <Text style={{ fontSize:11, fontWeight:700, color:'#1677ff', textTransform:'uppercase', letterSpacing:1 }}>
              Original Document{originals.length > 1 ? 's' : ''}
            </Text>
          </div>
          {originals.map(renderFile)}
        </div>
      )}
      {enhancements.map((a, i) => (
        <div key={`enh-${i}`} style={{ marginTop:8 }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:6,
            background:'#f6ffed', border:'1px solid #b7eb8f',
            borderRadius:4, padding:'2px 10px', marginBottom:6,
          }}>
            <FileOutlined style={{ color:'#52c41a', fontSize:12 }} />
            <Text style={{ fontSize:11, fontWeight:700, color:'#52c41a', textTransform:'uppercase', letterSpacing:1 }}>
              Enhancement {enhancements.length > 1 ? `#${i+1}` : 'Document'}
            </Text>
          </div>
          {renderFile(a, i)}
        </div>
      ))}
    </div>
  );
}

// ─── FilePicker ───────────────────────────────────────────────────────────────
function FilePicker({ attachments, setAttachments }) {
  const beforeUpload = (file) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    if (!allowed.some(ext => file.name.toLowerCase().endsWith(ext))) {
      message.error(`"${file.name}" is not allowed. Only PDF or Word files.`);
      return Upload.LIST_IGNORE;
    }
    const reader = new FileReader();
    reader.onload = e =>
      setAttachments(prev => [...prev, { name: file.name, url: e.target.result }]);
    reader.readAsDataURL(file);
    return Upload.LIST_IGNORE;
  };
  return (
    <>
      <Upload beforeUpload={beforeUpload} showUploadList={false} accept=".pdf,.doc,.docx">
        <Button icon={<UploadOutlined />}>Choose File</Button>
      </Upload>
      {attachments.length > 0 && (
        <div style={{ marginTop:10 }}>
          {attachments.map(a => (
            <div key={a.name} style={{
              display:'flex', alignItems:'center', gap:10, marginBottom:6,
              padding:'5px 12px', background:'#f8faff',
              borderRadius:6, border:'1px solid #dde4f0',
            }}>
              <FileOutlined style={{ color: fileColor(a.name), fontSize:15 }} />
              <a href={a.url} target="_blank" rel="noreferrer" style={{ flex:1, color:'#1a5c38' }}>
                {a.name}
              </a>
              <Tooltip title="Download">
                <Button type="link" size="small" icon={<DownloadOutlined />}
                  onClick={() => downloadFile(a)} style={{ padding:0, color:'#1a5c38' }} />
              </Tooltip>
              <Button type="link" size="small" danger
                onClick={() => setAttachments(p => p.filter(x => x.name !== a.name))}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SendRequirement() {
  const [form]    = Form.useForm();
  const [enhForm] = Form.useForm();

  const sendPermissions = GetPermissions('send requirement');
  const canCreate = sendPermissions.includes('create');

  const authUser     = getAuthUser();
  const defaultName  = authUser ? `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() : '';
  const defaultEmail = authUser?.email || '';
  const defaultPhone = authUser?.phone || '';

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
  // Templates indexed by stakeholder._id
  const [templateMap,    setTemplateMap]    = useState({});
  // All registered stakeholders
  const [providers,      setProviders]      = useState([]);
  // The currently selected provider id in the form
  const [selectedSpId,   setSelectedSpId]   = useState(null);

  // ── loaders ───────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const res = await request.get({ entity: 'stakeholder-requirement/mine' });
      setRequirements(Array.isArray(res?.result) ? res.result : []);
    } catch { message.error('Unable to load your submissions.');
    } finally { setLoading(false); }
  };

  const loadTemplates = async () => {
    try {
      const res = await request.list({ entity: 'requirement-template' });
      if (Array.isArray(res?.result) && res.result.length > 0) {
        const map = {};
        let globalTemplate = null;

        // Sort: newest first (backend already does this, but be safe)
        const sorted = [...res.result].sort((a, b) => new Date(b.created) - new Date(a.created));

        for (const t of sorted) {
          if (t.isGlobal) {
            if (!globalTemplate) globalTemplate = t;  // pick latest global
          } else {
            const spId = t.stakeholder?._id || t.stakeholder;
            if (spId && !map[spId]) map[spId] = t;    // specific always wins, pick latest
          }
        }

        if (globalTemplate) map['__global__'] = globalTemplate;
        setTemplateMap(map);
      } else {
        // Fallback: fetch global templates via the public listByProvider endpoint
        // (no permission check) using a dummy call to get global templates
        await loadGlobalTemplate();
      }
    } catch {
      // If list is forbidden (e.g. SP role has no template read permission),
      // still try to load the global/latest template
      await loadGlobalTemplate();
    }
  };

  // Fetches only the latest global template by calling listByProvider with
  // a placeholder — works because listByProvider returns globals for any provider.
  // We call it with the first available provider if any, otherwise skip.
  const loadGlobalTemplate = async () => {
    try {
      // Try to get global templates directly via a known provider
      // Use listByProvider which has no permission gate
      const provRes = await request.filter({ 
        entity: 'user',
        options: { 
          filter: 'position',
          equal: 'Stakeholder'
        }
      });
      const provList = Array.isArray(provRes?.result) ? provRes.result : [];

      if (provList.length === 0) return;

      // Fetch templates for the first provider — this returns both specific + global
      const tmplRes = await request.get({
        entity: `requirement-template/list-by-provider/${provList[0]._id}`,
      });

      if (Array.isArray(tmplRes?.result)) {
        const map = {};
        let globalTemplate = null;
        const sorted = [...tmplRes.result].sort((a, b) => new Date(b.created) - new Date(a.created));

        for (const t of sorted) {
          if (t.isGlobal) {
            if (!globalTemplate) globalTemplate = t;
          } else {
            const spId = t.stakeholder?._id || t.stakeholder;
            if (spId && !map[spId]) map[spId] = t;
          }
        }
        if (globalTemplate) map['__global__'] = globalTemplate;
        setTemplateMap(map);
      }
    } catch { /* silent */ }
  };

  const loadProviders = async () => {
    try {
      const res = await request.filter({ 
        entity: 'user',
        options: { 
          filter: 'position',
          equal: 'Stakeholder'
        }
      });
      const users = Array.isArray(res?.result) ? res.result : [];
      // Transform users to look like stakeholders
      const transformed = users.map(u => ({
        _id: u._id,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        company: u.company || '',
      }));
      setProviders(transformed);
    } catch { /* non-fatal */ }
  };

  useEffect(() => { load(); loadTemplates(); loadProviders(); }, []);

  // ── Derived: template for selected provider (specific → global fallback) ──
  // A provider-specific template always wins. If none exists, the global
  // template (isGlobal=true, stored under '__global__') is used as fallback.
  const selectedTemplate = selectedSpId
    ? (templateMap[selectedSpId] || templateMap['__global__'] || null)
    : null;
  const templateExists = Boolean(selectedTemplate);

  // Providers that have NO template (specific or global) — for the warning badge
  const hasGlobal = Boolean(templateMap['__global__']);
  const providersWithoutTemplate = hasGlobal
    ? []   // global covers everyone
    : providers.filter(p => !templateMap[p._id]);

  // ── submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (values) => {
    // Hard gate: template MUST exist for the selected provider (specific OR global)
    const hasSpecific = Boolean(templateMap[values.stakeholder]);
    const hasGlobalFallback = Boolean(templateMap['__global__']);
    if (!hasSpecific && !hasGlobalFallback) {
      message.error(
        'No requirement template has been uploaded for this stakeholder. ' +
        'An administrator must upload a template before you can submit a requirement.',
        6
      );
      return;
    }
    if (attachments.length === 0) {
      message.warning('Please attach at least one file before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await request.create({
        entity: 'stakeholder-requirement',
        jsonData: { ...values, attachments },
      });
      if (res?.success) {
        message.success('Requirement submitted successfully.');
        form.resetFields();
        setAttachments([]);
        setSelectedSpId(null);
        load();
      }
    } catch { message.error('Submission failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  // ── view detail ───────────────────────────────────────────────────────────
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

  // ── enhancement ───────────────────────────────────────────────────────────
  const openEnhancement = async (record) => {
    try {
      const res = await request.read({ entity: 'stakeholder-requirement', id: record._id });
      setEnhTarget(res?.success ? res.result : record);
    } catch { setEnhTarget(record); }
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
        entity: `stakeholder-requirement/enhancement/${enhTarget._id}`,
        jsonData: {
          description: values.description,
          senderName:  defaultName,
          senderEmail: defaultEmail,
          senderPhone: defaultPhone,
          attachments: enhAttachments,
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

  // ── table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      title: <b>#</b>, key:'serial', width:56, align:'center',
      render:(_, __, i) => <Text type="secondary">{i+1}</Text>,
    },
    { title:<b>Sender</b>, dataIndex:'senderName', key:'senderName' },
    {
      title:<b>Stakeholder</b>, key:'sp', width:160,
      render:(_, r) => r.stakeholder?.name
        ? <Tag color="geekblue">{r.stakeholder.name}</Tag>
        : <Text type="secondary">—</Text>,
    },
    {
      title:<b>Status</b>, key:'status', width:180,
      render:(_, r) => statusTag(r.status),
    },
    {
      title:<b>Submitted At</b>, key:'submittedAt', width:180,
      render:(_, r) => new Date(r.submittedAt).toLocaleString(),
    },
    {
      title:<b>Approved By</b>, key:'approvedBy', width:150,
      render:(_, r) => fullName(r.approvedBy),
    },
    {
      title:(
        <Tooltip title="Reference template for the stakeholder linked to this requirement">
          <b>Template</b>
        </Tooltip>
      ),
      key:'template', width:200,
      render:(_, r) => {
        const spId = r.stakeholder?._id || r.stakeholder;
        // Specific template wins; fall back to global if no specific one
        const tmpl = spId
          ? (templateMap[spId] || templateMap['__global__'] || null)
          : (templateMap['__global__'] || null);
        if (!tmpl) return <Tag color="red" icon={<WarningOutlined />}>No Template</Tag>;
        return (
          <Tooltip title={`Download: ${tmpl.file?.name}${tmpl.isGlobal ? ' (Global)' : ''}`}>
            <Button type="link" size="small"
              icon={<FileTextOutlined />}
              style={{ color: tmpl.isGlobal ? '#722ed1' : '#1a5c38', padding:0, maxWidth:190, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}
              onClick={() => downloadFile(tmpl.file)}>
              {tmpl.title || tmpl.file?.name}
              {tmpl.isGlobal && <Tag color="purple" style={{ fontSize:9, padding:'0 3px', marginLeft:4 }}>Global</Tag>}
            </Button>
          </Tooltip>
        );
      },
    },
    {
      title:<b>Action</b>, key:'action', width:148,
      render:(_, r) => {
        const opts = [
          { value:'view',    label:'👁  View Detail' },
          ...(r.status === 'rejected'
            ? [{ value:'enhance', label:'✏️  Add Enhancement' }] : []),
        ];
        return (
          <Select placeholder="Select action" size="small" style={{ width:148 }}
            value={null}
            onChange={val => {
              if (val === 'view')    viewDetail(r);
              if (val === 'enhance') openEnhancement(r);
            }}
            options={opts}
          />
        );
      },
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ paddingBottom:40 }}>

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        marginBottom:16, padding:'16px 20px',
        background:'#fff', borderRadius:8, boxShadow:'0 1px 4px rgba(0,0,0,0.07)',
      }}>
        <div>
          <Title level={4} style={{ margin:0 }}>Send Requirement</Title>
          <Text type="secondary">
            Select a stakeholder, review its reference template, then attach and submit your document.
          </Text>
        </div>
      </div>

      {/* ── Workflow Steps banner ────────────────────────────────────────── */}
      <Card style={{ marginBottom:20, borderRadius:8, boxShadow:'0 1px 4px rgba(0,0,0,0.07)' }}
        bodyStyle={{ padding:'16px 24px' }}>
        <Steps
          size="small"
          current={
            !selectedSpId          ? 0 :   // step 1 — pick a provider
            !templateExists        ? 0 :   // still step 1 — blocked, provider has no template
            attachments.length > 0 ? 2 :   // step 3 — file chosen, ready to submit
                                     1     // step 2 — template available, waiting for file
          }
        >
          <Step title="Select Provider" description="Choose the stakeholder" />
          <Step
            title="Download Template"
            description={
              !selectedSpId
                ? 'Select a provider first'   // neutral — no provider yet
                : templateExists
                ? <span style={{ color:'#1a5c38', fontWeight:500 }}>Template available — download &amp; use it</span>
                : <span style={{ color:'#ff4d4f' }}>No template yet — submission blocked</span>
            }
          />
          <Step title="Attach &amp; Submit" description="Upload your prepared document" />
        </Steps>
      </Card>

      {/* ── Submit Form ──────────────────────────────────────────────────── */}
      {canCreate ? (
        <Card style={{ marginBottom:24, borderRadius:8, boxShadow:'0 1px 4px rgba(0,0,0,0.07)' }}
          bodyStyle={{ padding:'20px 24px' }}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>

            {/* Row 1 — sender info (auto-filled from session) */}
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item label="Sender Name" name="senderName" initialValue={defaultName}
                  rules={[{ required:true }]}>
                  <Input readOnly style={{ cursor:'default' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item label="Sender Email" name="senderEmail" initialValue={defaultEmail}
                  rules={[{ required:true, type:'email' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item label="Sender Phone" name="senderPhone" initialValue={defaultPhone}
                  rules={[{ required:true, message:'Phone is required.' }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            {/* Row 2 — date (auto) + stakeholder select */}
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item label="Date">
                  <Input readOnly value={new Date().toLocaleDateString()}
                    style={{ cursor:'default' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={16}>
                <Form.Item label="Stakeholder" name="stakeholder"
                  rules={[{ required:true, message:'Please select a stakeholder.' }]}
                  extra={
                    selectedSpId && !templateExists
                      ? <Text type="danger" style={{ fontSize:12 }}>
                          <WarningOutlined /> No template uploaded for this provider.
                          Submission is blocked until an administrator uploads one.
                        </Text>
                      : selectedSpId && templateExists
                      ? <Text style={{ color:'#1a5c38', fontSize:12 }}>
                          <CheckCircleOutlined /> Template available — download it below before preparing your document.
                        </Text>
                      : <Text type="secondary" style={{ fontSize:12 }}>
                          Select a provider to see if a reference template is available.
                        </Text>
                  }
                >
                  <Select
                    placeholder="Select stakeholder…"
                    showSearch
                    optionFilterProp="label"
                    onChange={async (spId) => {
                      setSelectedSpId(spId);
                      // Always re-fetch templates for the selected provider
                      // using the public listByProvider endpoint — works for all roles
                      if (spId) {
                        try {
                          const res = await request.get({
                            entity: `requirement-template/list-by-provider/${spId}`,
                          });
                          if (Array.isArray(res?.result)) {
                            const map = { ...templateMap };
                            let latestGlobal = null;
                            const sorted = [...res.result].sort((a, b) => new Date(b.created) - new Date(a.created));
                            for (const t of sorted) {
                              if (t.isGlobal) {
                                if (!latestGlobal) latestGlobal = t; // latest global
                              } else {
                                const tid = t.stakeholder?._id || t.stakeholder;
                                if (tid && !map[tid]) map[tid] = t;
                              }
                            }
                            if (latestGlobal) map['__global__'] = latestGlobal;
                            setTemplateMap(map);
                          }
                        } catch { /* silent */ }
                      }
                    }}
                    options={providers.map(p => ({
                      value: p._id,
                      label: p.name + (p.company ? ` (${p.company})` : ''),
                    }))}
                    optionRender={option => {
                      const hasSpecific = Boolean(templateMap[option.value]);
                      const hasGlobalTmpl = Boolean(templateMap['__global__']);
                      const hasT = hasSpecific || hasGlobalTmpl;
                      return (
                        <Space>
                          {hasT
                            ? <CheckCircleOutlined style={{ color:'#1a5c38' }} />
                            : <WarningOutlined style={{ color:'#faad14' }} />}
                          <span style={{ color: hasT ? 'inherit' : '#8c8c8c' }}>
                            {option.label}
                          </span>
                          {hasSpecific && (
                            <Tag color="success" style={{ fontSize:10, padding:'0 4px', marginLeft:4 }}>
                              Own Template
                            </Tag>
                          )}
                          {!hasSpecific && hasGlobalTmpl && (
                            <Tag color="purple" style={{ fontSize:10, padding:'0 4px', marginLeft:4 }}>
                              Global Template
                            </Tag>
                          )}
                          {!hasT && (
                            <Tag color="warning" style={{ fontSize:10, padding:'0 4px', marginLeft:4 }}>
                              No Template
                            </Tag>
                          )}
                        </Space>
                      );
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* ── Template box: shown after provider selected ────────────── */}
            {selectedSpId && (
              templateExists ? (
                /* ✅ Template found (specific or global fallback) */
                <div style={{
                  background: selectedTemplate.isGlobal ? '#f9f0ff' : '#f6ffed',
                  border: `2px solid ${selectedTemplate.isGlobal ? '#722ed1' : '#52c41a'}`,
                  borderRadius:10, padding:'14px 18px', marginBottom:20,
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                    <FileTextOutlined style={{ color: selectedTemplate.isGlobal ? '#722ed1' : '#1a5c38', fontSize:18 }} />
                    <Text strong style={{ color: selectedTemplate.isGlobal ? '#722ed1' : '#1a5c38', fontSize:14 }}>
                      {selectedTemplate.isGlobal
                        ? 'Global Reference Template (applies to all providers)'
                        : 'Reference Template for This Provider'}
                    </Text>
                    <Tag color={selectedTemplate.isGlobal ? 'purple' : 'success'} style={{ marginLeft:'auto' }}>
                      {selectedTemplate.isGlobal ? 'Global' : 'Required'}
                    </Tag>
                  </div>
                  <Text type="secondary" style={{ display:'block', marginBottom:12, fontSize:12 }}>
                    Download this template, prepare your requirement document based on it, then attach the completed file below.
                  </Text>
                  <div style={{
                    display:'flex', alignItems:'center', gap:10,
                    padding:'8px 14px', background:'#fff',
                    borderRadius:8, border:`1px solid ${selectedTemplate.isGlobal ? '#d3adf7' : '#b7eb8f'}`,
                  }}>
                    <FileTextOutlined style={{ color: fileColor(selectedTemplate.file?.name), fontSize:20 }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, color: selectedTemplate.isGlobal ? '#722ed1' : '#1a5c38' }}>
                        {selectedTemplate.title || selectedTemplate.file?.name}
                      </div>
                      <div style={{ fontSize:11, color:'#8c8c8c' }}>
                        Uploaded by {fullName(selectedTemplate.uploadedBy)} ·{' '}
                        {selectedTemplate.uploadedAt
                          ? new Date(selectedTemplate.uploadedAt).toLocaleDateString()
                          : ''}
                      </div>
                    </div>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      style={{
                        backgroundColor: selectedTemplate.isGlobal ? '#722ed1' : '#1a5c38',
                        borderColor:     selectedTemplate.isGlobal ? '#722ed1' : '#1a5c38',
                      }}
                      onClick={() => downloadFile(selectedTemplate.file)}
                    >
                      Download Template
                    </Button>
                  </div>
                </div>
              ) : (
                /* ❌ No template — hard block with clear message */
                <Alert
                  type="error"
                  showIcon
                  icon={<WarningOutlined />}
                  style={{ marginBottom:20, borderRadius:8 }}
                  message="Template Required — Submission Blocked"
                  description={
                    <span>
                      No requirement template has been uploaded for <b>{providers.find(p=>p._id===selectedSpId)?.name || 'this stakeholder'}</b>.
                      <br/>
                      An administrator must upload a template via <b>Requirement Templates</b> before you can submit a requirement for this provider.
                    </span>
                  }
                />
              )
            )}

            {/* ── Attachment upload — only active when template exists ───── */}
            <Form.Item
              label={
                <span>
                  <span style={{ color:'#ff4d4f' }}>* </span>
                  Requirement Document{' '}
                  <Text type="secondary">(PDF / DOC / DOCX — prepare based on the template above)</Text>
                </span>
              }
            >
              <div style={{
                opacity: (selectedSpId && !templateExists) ? 0.4 : 1,
                pointerEvents: (selectedSpId && !templateExists) ? 'none' : 'auto',
              }}>
                <FilePicker attachments={attachments} setAttachments={setAttachments} />
              </div>
            </Form.Item>

            <Form.Item style={{ marginBottom:0 }}>
              <Tooltip
                title={
                  !selectedSpId
                    ? 'Select a stakeholder first'
                    : !templateExists
                    ? 'A template must be uploaded for this provider before submission is allowed'
                    : ''
                }
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  disabled={!selectedSpId || !templateExists}
                  style={{
                    backgroundColor: (selectedSpId && templateExists) ? '#1a5c38' : undefined,
                    borderColor:     (selectedSpId && templateExists) ? '#1a5c38' : undefined,
                    minWidth:200,
                  }}
                >
                  Submit Requirement
                </Button>
              </Tooltip>
            </Form.Item>

          </Form>
        </Card>
      ) : (
        <Alert style={{ marginBottom:20 }} type="warning" showIcon
          message="You do not have permission to submit requirements." />
      )}

      {/* ── My Submissions Table ──────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <Title level={5} style={{ margin:0 }}>My Submissions</Title>
        <Button size="small" icon={<ReloadOutlined />} onClick={load} loading={loading}>
          Refresh
        </Button>
      </div>

      <Card bodyStyle={{ padding:0 }}
        style={{ borderRadius:8, boxShadow:'0 1px 4px rgba(0,0,0,0.07)', overflow:'hidden' }}>
        <Table
          dataSource={requirements}
          rowKey="_id"
          columns={columns}
          loading={loading}
          size="middle"
          scroll={{ x:1000 }}
          rowClassName={(_, i) => i % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
          pagination={{
            pageSize:5, showSizeChanger:true,
            pageSizeOptions:['5','10','20','50'],
            showTotal:(total, range) => `${range[0]}–${range[1]} of ${total} entries`,
            position:['bottomCenter'],
          }}
          locale={{ emptyText:'No requirements submitted yet.' }}
        />
      </Card>

      {/* ── Detail Modal ─────────────────────────────────────────────────── */}
      <Modal
        visible={detailVisible}
        title={<Space><EyeOutlined style={{ color:'#1a5c38' }} /><b>Requirement Details</b></Space>}
        onCancel={() => { setDetailVisible(false); setSelected(null); }}
        footer={<Button onClick={() => { setDetailVisible(false); setSelected(null); }}>Close</Button>}
        width={700} destroyOnClose
      >
        {detailLoading && (
          <div style={{ textAlign:'center', padding:40 }}>
            <Text type="secondary">Loading details…</Text>
          </div>
        )}
        {!detailLoading && selected && (
          <Descriptions bordered column={1} size="small"
            labelStyle={{ width:160, fontWeight:500, background:'#f8faff' }}>
            <Descriptions.Item label="Sender">{selected.senderName}</Descriptions.Item>
            <Descriptions.Item label="Email">{selected.senderEmail || '—'}</Descriptions.Item>
            <Descriptions.Item label="Phone">{selected.senderPhone || '—'}</Descriptions.Item>
            {selected.stakeholder && (
              <Descriptions.Item label="Stakeholder">
                <Tag color="geekblue" style={{ fontWeight:500 }}>
                  {selected.stakeholder?.name || '—'}
                </Tag>
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
                <div style={{ width:'100%' }}>
                  {selected.enhancementHistory.map(h => (
                    <div key={h.round} style={{
                      marginBottom:10, padding:'8px 12px',
                      background:'#f6ffed', borderRadius:6, border:'1px solid #b7eb8f',
                    }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <Text strong style={{ color:'#52c41a' }}>Round #{h.round}</Text>
                        <Text type="secondary" style={{ fontSize:12 }}>
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
        title={<Space><PlusCircleOutlined style={{ color:'#1a5c38' }} /><b>Submit Enhancement</b></Space>}
        onCancel={() => setEnhVisible(false)}
        onOk={submitEnhancement}
        okText="Submit Enhancement"
        confirmLoading={enhSubmitting}
        okButtonProps={{ style:{ backgroundColor:'#1a5c38', borderColor:'#1a5c38' } }}
        width={580} destroyOnClose
      >
        <div style={{
          background:'#e6f4ff', border:'1px solid #91caff',
          borderRadius:8, padding:'12px 16px', marginBottom:4,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
            <FileOutlined style={{ color:'#1677ff' }} />
            <Text strong style={{ color:'#1677ff', fontSize:12, textTransform:'uppercase', letterSpacing:1 }}>
              Original Document{enhTarget?.attachments?.filter(a=>!a.type||a.type==='original').length>1?'s':''}
            </Text>
          </div>
          {enhTarget && Array.isArray(enhTarget.attachments) &&
           enhTarget.attachments.filter(a=>!a.type||a.type==='original').length > 0 ? (
            enhTarget.attachments.filter(a=>!a.type||a.type==='original').map((a,i) => (
              <div key={`orig-${i}`} style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'5px 10px', background:'#fff',
                borderRadius:6, border:'1px solid #91caff', marginBottom:4,
              }}>
                <FileOutlined style={{ color:fileColor(a.name), fontSize:15 }} />
                <a href={a.url} target="_blank" rel="noreferrer"
                  style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'#1a5c38' }}>
                  {a.name}
                </a>
                <Tooltip title="Download">
                  <Button type="link" size="small" icon={<DownloadOutlined />}
                    onClick={()=>downloadFile(a)} style={{ padding:0, color:'#1677ff' }} />
                </Tooltip>
              </div>
            ))
          ) : (
            <Text type="secondary" style={{ fontSize:12 }}>No original attachments on record.</Text>
          )}
          {enhTarget && Array.isArray(enhTarget.attachments) &&
           enhTarget.attachments.filter(a=>a.type==='enhancement').length > 0 && (
            <div style={{ marginTop:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                <FileOutlined style={{ color:'#52c41a' }} />
                <Text strong style={{ color:'#52c41a', fontSize:12, textTransform:'uppercase', letterSpacing:1 }}>
                  Previous Enhancement{enhTarget.attachments.filter(a=>a.type==='enhancement').length>1?'s':''}
                </Text>
              </div>
              {enhTarget.attachments.filter(a=>a.type==='enhancement').map((a,i) => (
                <div key={`prev-enh-${i}`} style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'5px 10px', background:'#fff',
                  borderRadius:6, border:'1px solid #b7eb8f', marginBottom:4,
                }}>
                  <FileOutlined style={{ color:fileColor(a.name), fontSize:15 }} />
                  <a href={a.url} target="_blank" rel="noreferrer"
                    style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'#1a5c38' }}>
                    {a.name}
                  </a>
                  <Tooltip title="Download">
                    <Button type="link" size="small" icon={<DownloadOutlined />}
                      onClick={()=>downloadFile(a)} style={{ padding:0, color:'#52c41a' }} />
                  </Tooltip>
                </div>
              ))}
            </div>
          )}
        </div>
        <Divider style={{ margin:'16px 0', borderColor:'#d9d9d9' }}>
          <Text type="secondary" style={{ fontSize:12 }}>Enhancement Details Below</Text>
        </Divider>
        <Form form={enhForm} layout="vertical">
          <Form.Item label="Enhancement Description" name="description"
            rules={[{ required:true, message:'Please describe your enhancement.' }]}>
            <TextArea rows={4} placeholder="Explain what you changed or improved…"
              showCount maxLength={1000} />
          </Form.Item>
          <Form.Item label={
            <span>Enhancement Document
              <Text type="secondary" style={{ fontWeight:400, marginLeft:6 }}>(PDF / DOC / DOCX — optional)</Text>
            </span>
          }>
            <div style={{ background:'#f6ffed', border:'1px solid #b7eb8f', borderRadius:8, padding:'12px 16px' }}>
              <FilePicker attachments={enhAttachments} setAttachments={setEnhAttachments} />
              {enhAttachments.length === 0 && (
                <Text type="secondary" style={{ fontSize:12, marginTop:6, display:'block' }}>
                  Upload a new version if the content has changed.
                </Text>
              )}
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Shared table styles ───────────────────────────────────────────── */}
      <style>{`
        .table-row-light td { background:#ffffff !important; }
        .table-row-dark  td { background:#f8faff !important; }
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
