import React, { useCallback, useEffect, useState } from 'react';
import {
  Badge, Button, Card, Col, Divider, Input, Radio, Row, Space, Spin,
  Table, Tag, Typography, message, Select,
} from 'antd';

import dayjs from 'dayjs';
import request from '@/request/request';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';

const { Title, Text } = Typography;
const BRAND = '#1a5c38';

function StatusTag({ status }) {
  if (status === 'submitted')
    return <Tag icon={<span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>check_circle</span>} color="success">Responded</Tag>;
  return <Tag icon={<span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>pending</span>} color="warning">Pending</Tag>;
}

function ResultTag({ r }) {
  if (!r || r === 'pending') return <Tag color="default">—</Tag>;
  return r === 'pass'
    ? <Tag icon={<span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>check_circle</span>} color="success">Pass</Tag>
    : <Tag icon={<span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>cancel</span>} color="error">Fail</Tag>;
}

// ── PDF generator (pure-browser, no library needed) ──────────────────────────
function buildPdfContent(uat) {
  const rows = (uat.features || []).map((f, i) => `
    <tr style="background:${i%2===0?'#fff':'#f8fafb'}">
      <td style="padding:8px;border:1px solid #ddd;text-align:center">${f.no}</td>
      <td style="padding:8px;border:1px solid #ddd">${f.feature}</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:center">${f.businessValidationConfirmed||'—'}</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:center;color:${f.pass?'#1a5c38':(f.fail?'#ff4d4f':'#000')};font-weight:600">${f.pass?'PASS':(f.fail?'FAIL':'—')}</td>
      <td style="padding:8px;border:1px solid #ddd">${f.remark||'—'}</td>
    </tr>`).join('');

  const passCount = (uat.features||[]).filter(f=>f.pass).length;
  const total     = (uat.features||[]).length;

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>UAT Report — ${uat.uatNumber}</title>
    <style>body{font-family:Arial,sans-serif;margin:30px;color:#222}
    h1{color:#1a5c38}table{width:100%;border-collapse:collapse}
    th{background:#1a5c38;color:#fff;padding:10px;border:1px solid #1a5c38}
    .summary{background:#f0f7f4;padding:14px 18px;border-radius:6px;margin:20px 0;border-left:4px solid #1a5c38}
    </style></head><body>
    <h1>UAT Sign-Off Report</h1>
    <div class="summary">
      <table style="width:100%;border:none">
        <tr><td style="border:none;padding:3px 0;width:50%"><b>UAT No:</b> ${uat.uatNumber||'—'}</td>
            <td style="border:none;padding:3px 0"><b>Project:</b> ${uat.project?.title||'—'}</td></tr>
        <tr><td style="border:none;padding:3px 0"><b>Sent By:</b> ${uat.sentBy||'—'}</td>
            <td style="border:none;padding:3px 0"><b>Date:</b> ${uat.date?dayjs(uat.date).format('YYYY-MM-DD'):'—'}</td></tr>
        <tr><td style="border:none;padding:3px 0"><b>Service Provider:</b> ${uat.serviceProvider?.name||'—'}</td>
            <td style="border:none;padding:3px 0"><b>Result:</b> <span style="color:${passCount===total?'#1a5c38':'#ff4d4f'};font-weight:700">${passCount}/${total} Pass</span></td></tr>
        <tr><td style="border:none;padding:3px 0"><b>Responded By:</b> ${uat.respondedBy||'—'}</td>
            <td style="border:none;padding:3px 0"><b>Responded At:</b> ${uat.respondedAt?dayjs(uat.respondedAt).format('YYYY-MM-DD HH:mm'):'—'}</td></tr>
        ${uat.overallRemark?`<tr><td colspan="2" style="border:none;padding:3px 0"><b>Overall Remark:</b> ${uat.overallRemark}</td></tr>`:''}
      </table>
    </div>
    <table>
      <thead><tr>
        <th style="width:50px">No</th>
        <th>Feature / Capability</th>
        <th style="width:130px">Business Validated</th>
        <th style="width:90px">Result</th>
        <th style="width:200px">Remark</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:40px;font-size:12px;color:#888">Generated on ${dayjs().format('YYYY-MM-DD HH:mm')} by PMS — UAT Module</p>
  </body></html>`;
}

function printAsPdf(uat) {
  const html  = buildPdfContent(uat);
  const win   = window.open('', '_blank');
  if (!win) { message.error('Popup blocked — please allow popups.'); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}

export default function SPUATDashboard() {
  document.title = 'SP UAT Portal – PMS';
  const { current } = useSelector(selectAuth);
  const spName = current ? `${current.firstName||''} ${current.lastName||''}`.trim() : '';

  const [records,     setRecords]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [rowValues,      setRowValues]      = useState({}); // { [featureId]: { pass, fail, remark } }
  const [overallRemarks, setOverallRemarks] = useState({}); // { [recordId]: string }
  const [submitLoading,  setSubmitLoading]  = useState({});

  // ── Load ────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await request.list({ entity: 'uat-signoff' });
      const data = Array.isArray(res?.result) ? res.result : [];
      setRecords(data);

      // Pre-fill existing values
      const initRows = {};
      const initRemarks = {};
      data.forEach(rec => {
        initRemarks[rec._id] = rec.overallRemark || '';
        (rec.features || []).forEach(f => {
          initRows[f._id] = { pass: f.pass || false, fail: f.fail || false, remark: f.remark || '' };
        });
      });
      setRowValues(initRows);
      setOverallRemarks(initRemarks);
    } catch { message.error('Failed to load UAT sign-offs.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateRow = (fId, key, val) => {
    setRowValues((prev) => ({ ...prev, [fId]: { ...prev[fId], [key]: val } }));
  };

  const handleRespond = async (record) => {
    const features = (record.features || []).map((f) => ({
      _id:        f._id,
      pass:       rowValues[f._id]?.pass || false,
      fail:       rowValues[f._id]?.fail || false,
      remark:     rowValues[f._id]?.remark || '',
    }));

    const allDone = features.every((f) => f.pass || f.fail);
    if (!allDone) { message.warning('Please mark every feature as Pass or Fail before saving.'); return; }

    const missingRemark = features.find(f => f.fail && !f.remark.trim());
    if (missingRemark) {
      message.error('You must provide a remark for all failed features before saving.');
      return;
    }

    setSubmitLoading(prev => ({ ...prev, [record._id]: true }));
    try {
      const overallRemark = overallRemarks[record._id] || '';
      const mergedUAT = {
        ...record,
        features: record.features.map((f) => ({
          ...f,
          pass:   rowValues[f._id]?.pass,
          fail:   rowValues[f._id]?.fail,
          remark: rowValues[f._id]?.remark || f.remark,
        })),
        respondedBy: spName,
        respondedAt: new Date().toISOString(),
        overallRemark,
      };
      
      const pdfHtml   = buildPdfContent(mergedUAT);
      const pdfBase64 = `data:text/html;base64,${btoa(unescape(encodeURIComponent(pdfHtml)))}`;
      const pdfName   = `UAT_Report_${record.uatNumber}_${dayjs().format('YYYYMMDD')}.html`;

      const res = await request.patch({
        entity: `uat-signoff/${record._id}/respond`,
        jsonData: {
          respondedBy: spName,
          overallRemark,
          features,
          pdfReport: { name: pdfName, url: pdfBase64 },
        },
      });

      if (res?.success) {
        message.success('UAT Saved Successfully.');
        load();
      } else { message.error(res?.message || 'Submission failed.'); }
    } catch { message.error('Submission failed.'); }
    finally { setSubmitLoading(prev => ({ ...prev, [record._id]: false })); }
  };

  const handleAttach = async (rec) => {
    try {
      const res = await request.patch({
        entity: `uat-signoff/${rec._id}/attach-pdf`,
        jsonData: {},
      });
      if (res?.success) { message.success('PDF report attached to project.'); load(); }
      else { message.error(res?.message || 'Attach failed.'); }
    } catch { message.error('Attach failed.'); }
  };

  const pending   = records.filter((r) => r.responseStatus !== 'submitted').length;
  const responded = records.filter((r) => r.responseStatus === 'submitted').length;

  // ── Expanded Row Render ──────────────────────────────────────────────────
  const expandedRowRender = (record) => {
    const detailCols = [
      { title: 'No.', dataIndex: 'no', key: 'no', width: 60, align: 'center', render: (t) => <Text strong style={{ color: '#5f6368' }}>{t}</Text> },
      { title: 'Feature / Capability', dataIndex: 'feature', key: 'feature', render: (t) => <Text style={{ fontSize: 15 }}>{t}</Text> },
      { title: 'Business Validation', dataIndex: 'businessValidationConfirmed', key: 'bvc', width: '20%' },
      { 
        title: 'Validation Result', key: 'testResult', width: 220, align: 'center',
        render: (_, f) => {
          const isPass = rowValues[f._id]?.pass;
          const isFail = rowValues[f._id]?.fail;
          return (
            <Space size="middle">
              <div
                onClick={() => { updateRow(f._id, 'pass', true); updateRow(f._id, 'fail', false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                  border: `1px solid ${isPass ? '#4caf50' : '#e0e0e0'}`,
                  background: isPass ? '#e8f5e9' : '#fff',
                  color: isPass ? '#2e7d32' : '#5f6368',
                  fontWeight: isPass ? 600 : 400,
                  transition: 'all 0.2s ease',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{isPass ? 'check_circle' : 'radio_button_unchecked'}</span>
                Pass
              </div>
              <div
                onClick={() => { updateRow(f._id, 'pass', false); updateRow(f._id, 'fail', true); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                  border: `1px solid ${isFail ? '#f44336' : '#e0e0e0'}`,
                  background: isFail ? '#ffebee' : '#fff',
                  color: isFail ? '#c62828' : '#5f6368',
                  fontWeight: isFail ? 600 : 400,
                  transition: 'all 0.2s ease',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{isFail ? 'cancel' : 'radio_button_unchecked'}</span>
                Fail
              </div>
            </Space>
          );
        }
      },
      { 
        title: 'Remarks', key: 'remark', width: '25%',
        render: (_, f) => (
          <Input 
            size="small" 
            placeholder="Optional remark..." 
            value={rowValues[f._id]?.remark || ''} 
            onChange={(e) => updateRow(f._id, 'remark', e.target.value)}
          />
        )
      },
    ];

    return (
      <div style={{ margin: '16px 32px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <Text strong style={{ fontSize: 16, color: BRAND, marginBottom: 16, display: 'block' }}>Validate Features</Text>
        <Table
          columns={detailCols}
          dataSource={record.features || []}
          pagination={false}
          rowKey="_id"
          style={{ marginBottom: 24 }}
          className="nested-material-table"
        />
        <Divider style={{ margin: '24px 0' }} />
        <Row gutter={24} align="bottom">
          <Col flex="auto">
            <Text strong style={{ color: '#5f6368' }}>Overall Remark (Optional)</Text>
            <Input.TextArea 
              rows={2} 
              placeholder="Leave a final comment or summary of the UAT session..."
              value={overallRemarks[record._id] || ''} 
              onChange={e => setOverallRemarks(prev => ({ ...prev, [record._id]: e.target.value }))} 
              style={{ marginTop: 8, borderRadius: 8 }}
            />
          </Col>
          <Col flex="none">
            <Button 
              type="primary" 
              icon={<span className="material-symbols-outlined" style={{ fontSize: 18, verticalAlign: 'middle' }}>send</span>} 
              onClick={() => handleRespond(record)} 
              loading={submitLoading[record._id]}
              style={{ background: BRAND, borderColor: BRAND, borderRadius: 20, height: 40, padding: '0 24px', fontWeight: 500 }}
            >
              Save UAT Response
            </Button>
          </Col>
        </Row>
      </div>
    );
  };

  // ── Main Table Columns ────────────────────────────────────────────────────
  const cols = [
    {
      title: <b>UAT No</b>, dataIndex: 'uatNumber', width: 110,
      render: (v) => <Tag color="geekblue">{v || '—'}</Tag>,
    },
    {
      title: <b>Project Name</b>, key: 'project',
      render: (_, r) => <Text strong>{r.project?.title || '—'}</Text>,
    },
    {
      title: <b>Prepared By</b>, dataIndex: 'sentBy', width: 140,
    },
    {
      title: <b>Created Date</b>, key: 'date', width: 150,
      render: (_, r) => r.date ? dayjs(r.date).format('MMM DD, YYYY') : '—',
    },
    {
      title: <b>Status</b>, key: 'status', width: 120,
      render: (_, r) => <StatusTag status={r.responseStatus} />,
    },
    {
      title: <b>Result</b>, key: 'result', width: 110, align: 'center',
      render: (_, r) => {
        if (r.responseStatus !== 'submitted') return <Text type="secondary">—</Text>;
        const pass  = r.features?.filter((f) => f.pass).length || 0;
        const total = r.features?.length || 0;
        return (
          <Tag color={pass === total ? 'success' : 'error'}>
            {pass}/{total} Pass
          </Tag>
        );
      },
    },
    {
      title: <b>Action</b>, key: 'action', width: 180, align: 'center',
      render: (_, r) => {
        const options = [];
        if (r.responseStatus === 'submitted') {
          options.push({ value: 'print', label: 'Print PDF' });
          if (!r.attachedToProject) {
            options.push({ value: 'attach', label: 'Attach PDF' });
          }
        } else {
          return <Text type="secondary" style={{ fontSize: 12 }}>Expand to Respond</Text>;
        }
        
        return (
          <Space direction="vertical" size="small" style={{ width: '100%', textAlign: 'center' }}>
            <Select
              placeholder="Select Action"
              style={{ width: '100%', minWidth: 120, textAlign: 'left' }}
              value={null}
              onChange={(val) => {
                if (val === 'print') printAsPdf({
                  ...r,
                  respondedBy: r.respondedBy,
                  respondedAt: r.respondedAt,
                  overallRemark: r.overallRemark,
                });
                else if (val === 'attach') handleAttach(r);
              }}
              options={options}
            />
            {r.attachedToProject && <Tag color="cyan" style={{ margin: 0 }}>Attached ✓</Tag>}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ paddingBottom: 40, background: '#f5f7fa', minHeight: '100vh', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: '20px 28px', background: '#fff', borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.05)', border: 'none' }}>
        <Space align="center" size="middle">
          <div style={{ background: 'linear-gradient(135deg, #1a5c38 0%, #2e7d32 100%)', padding: 14, borderRadius: '50%', display: 'flex', boxShadow: '0 4px 12px rgba(26, 92, 56, 0.3)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#fff' }}>verified_user</span>
          </div>
          <div>
            <Title level={3} style={{ margin: 0, fontFamily: 'Roboto', fontWeight: 600, color: '#202124' }}>SP UAT Portal</Title>
            <Text type="secondary" style={{ fontSize: 14, letterSpacing: 0.2 }}>Review UAT sign-offs — expand a row to validate features</Text>
          </div>
        </Space>
        <Button icon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>} onClick={load} loading={loading} style={{ borderRadius: 20, height: 40, padding: '0 20px' }}>Refresh</Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        {[
          { label: 'Total',     val: records.length, color: BRAND    },
          { label: 'Pending',   val: pending,         color: '#faad14' },
          { label: 'Responded', val: responded,       color: '#52c41a' },
        ].map(({ label, val, color }) => (
          <Col xs={8} key={label}>
            <Card size="small" style={{ textAlign: 'center', borderLeft: `4px solid ${color}`, borderRadius: 8 }}>
              <Title level={3} style={{ margin: 0, color }}>{val}</Title>
              <Text type="secondary">{label}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
        ) : (
          <Table
            dataSource={records} columns={cols} rowKey="_id"
            size="middle" scroll={{ x: 900 }}
            pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t) => `${t} records` }}
            expandable={{
              expandedRowRender,
              expandIcon: ({ expanded, onExpand, record }) =>
                expanded ? (
                  <span className="material-symbols-outlined" onClick={e => onExpand(record, e)} style={{ color: '#5f6368', cursor: 'pointer', fontSize: 22, verticalAlign: 'middle', transition: 'all 0.2s' }}>keyboard_arrow_down</span>
                ) : (
                  <span className="material-symbols-outlined" onClick={e => onExpand(record, e)} style={{ color: '#5f6368', cursor: 'pointer', fontSize: 22, verticalAlign: 'middle', transition: 'all 0.2s' }}>keyboard_arrow_right</span>
                )
            }}
            rowClassName={(r, i) => i % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
          />
        )}
      </Card>

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
        .ant-table-thead > tr > th {
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
          padding: 0 !important;
        }
        /* Nested Table Override */
        .nested-material-table .ant-table-thead > tr > th {
          background: #f1f3f4 !important;
          color: #5f6368 !important;
          border-bottom: 2px solid #e0e0e0 !important;
          padding: 12px 16px !important;
          font-size: 0.75rem;
        }
        .nested-material-table .ant-table-tbody > tr > td {
          padding: 12px 16px !important;
        }
      `}</style>
    </div>
  );
}
